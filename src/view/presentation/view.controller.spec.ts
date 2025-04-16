import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { Connection } from 'mongoose';
import { ViewService } from '../infrastructure/view.service';
import { getViewSchema, ViewDoc } from '../infrastructure/view.schema';
import { ViewModule } from '../view.module';
import { View } from '../domain/view';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import {
  Breakpoints,
  DataFieldRef,
  GridContainer,
  GridItem,
  NodeType,
  SectionGrid,
  Size,
} from '../domain/node';
import { ignoreIds } from '../../../test/utils';

describe('ViewController', () => {
  let app: INestApplication;
  const authContext = new AuthContext();
  let viewService: ViewService;
  authContext.user = new User(randomUUID(), 'test@test.test');
  const userId = authContext.user.id;
  const organizationId = randomUUID();
  const otherOrganizationId = randomUUID();

  let mongoConnection: Connection;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeatureAsync([
          {
            name: ViewDoc.name,
            useFactory: () => getViewSchema(),
          },
        ]),
        ViewModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: keycloakAuthTestingGuard,
        },
      ],
    })
      .overrideProvider(KeycloakResourcesService)
      .useValue(
        KeycloakResourcesServiceTesting.fromPlain({
          users: [{ id: authContext.user.id, email: authContext.user.email }],
        }),
      )
      .compile();

    app = moduleRef.createNestApplication();
    viewService = moduleRef.get<ViewService>(ViewService);
    mongoConnection = moduleRef.get<Connection>(getConnectionToken());

    await app.init();
  });

  const userNotMemberTxt = `fails if user is not member of organization`;
  const viewDoesNotBelongToOrga = `fails if view does not belong to organization`;

  it(`/CREATE view`, async () => {
    const body = { name: 'View Model' };
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/views`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);

    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    const found = await viewService.findOneOrFail(response.body.id);
    expect(response.body).toEqual(found.toPlain());
  });

  it(`/CREATE view ${userNotMemberTxt}`, async () => {
    const body = { name: 'My first draft' };
    const response = await request(app.getHttpServer())
      .post(`/organizations/${otherOrganizationId}/views`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  async function addNodeRequest(viewId: string, body: Object) {
    return await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/views/${viewId}/nodes`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
  }

  it(`/CREATE nodes`, async () => {
    const view = await viewService.save(
      View.create({
        name: 'my view',
        organizationId: otherOrganizationId,
        userId,
      }),
    );
    let body: any = { node: { type: NodeType.GRID_CONTAINER, cols: 3 } };
    let response = await addNodeRequest(view.id, body);
    const gridContainer = GridContainer.create({ cols: 3 });
    // add grid item
    body = {
      node: {
        type: NodeType.GRID_ITEM,
        sizes: [{ breakpoint: Breakpoints.md, colSpan: 4 }],
      },
      parentId: response.body.nodes[0].id,
    };
    response = await addNodeRequest(view.id, body);
    const gridItem = GridItem.create({
      sizes: [Size.create({ breakpoint: Breakpoints.md, colSpan: 4 })],
    });
    // add data field
    gridContainer.addGridItem(gridItem);
    body = {
      node: {
        type: NodeType.DATA_FIELD_REF,
        fieldId: 'f1',
      },
      parentId: response.body.nodes[0].children[3].id,
    };
    response = await addNodeRequest(view.id, body);
    const dataFieldItem = DataFieldRef.create({ fieldId: 'f1' });
    gridItem.replaceContent(dataFieldItem);
    // add section grid
    body = {
      node: {
        type: NodeType.SECTION_GRID,
        cols: 2,
        sectionId: 's1',
      },
      parentId: response.body.nodes[0].children[0].id,
    };
    response = await addNodeRequest(view.id, body);
    const firstGridItem = gridContainer.children[0];
    firstGridItem.replaceContent(
      SectionGrid.create({ sectionId: 's1', cols: 2 }),
    );

    const found = await viewService.findOneOrFail(response.body.id);
    expect(found.toPlain().nodes).toEqual(ignoreIds([gridContainer.toPlain()]));
  });

  it(`/GET view`, async () => {
    const view = await viewService.save(
      View.create({
        name: 'my view',
        organizationId,
        userId,
      }),
    );
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/views/${view.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );

    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(view.id);
  });

  it(`/GET view ${userNotMemberTxt}`, async () => {
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/views/${randomUUID()}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );

    expect(response.status).toEqual(403);
  });

  it(`/GET view ${viewDoesNotBelongToOrga}`, async () => {
    const view = await viewService.save(
      View.create({
        name: 'my view',
        organizationId: otherOrganizationId,
        userId,
      }),
    );
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}/views/${view.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.close();
  });
});
