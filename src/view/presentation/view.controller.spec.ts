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

describe('ViewController', () => {
  let app: INestApplication;
  const authContext = new AuthContext();
  let viewService: ViewService;
  authContext.user = new User(randomUUID(), 'test@test.test');
  const userId = authContext.user.id;
  const organizationId = randomUUID();
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
    const otherOrganizationId = randomUUID();
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

  it(`/GET view ${viewDoesNotBelongToOrga}`, async () => {
    const otherOrganizationId = randomUUID();
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
