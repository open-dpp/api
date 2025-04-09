import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Organization } from '../../organizations/domain/organization';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { OrganizationsModule } from '../../organizations/organizations.module';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { Connection } from 'mongoose';
import { ViewService } from '../infrastructure/view.service';
import { getViewSchema, ViewDoc } from '../infrastructure/view.schema';
import { ViewModule } from '../view.module';
import { View } from '../domain/view';
import { DataSource } from 'typeorm';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';

describe('ViewController', () => {
  let app: INestApplication;
  const authContext = new AuthContext();
  let organizationsService: OrganizationsService;
  let viewService: ViewService;
  let dataSource: DataSource;
  authContext.user = new User(randomUUID(), 'test@test.test');
  let mongoConnection: Connection;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([UserEntity, OrganizationEntity]),
        MongooseTestingModule,
        MongooseModule.forFeatureAsync([
          {
            name: ViewDoc.name,
            useFactory: () => getViewSchema(),
          },
        ]),
        OrganizationsModule,
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
    organizationsService =
      moduleRef.get<OrganizationsService>(OrganizationsService);

    viewService = moduleRef.get<ViewService>(ViewService);
    mongoConnection = moduleRef.get<Connection>(getConnectionToken());
    dataSource = moduleRef.get<DataSource>(DataSource);

    await app.init();
  });

  const userNotMemberTxt = `fails if user is not member of organization`;
  const viewDoesNotBelongToOrga = `fails if view does not belong to organization`;

  async function createOrganization(user: User = authContext.user) {
    const organization = Organization.create({
      name: 'My orga',
      user: user,
    });
    return organizationsService.save(organization);
  }

  it(`/CREATE view`, async () => {
    const organization = await createOrganization();
    const body = { name: 'View Model' };
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/views`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user,
          [organization],
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
    const otherUser = new User(randomUUID(), 'test@example.com');
    const organization = await createOrganization(otherUser);
    const otherOrganization = await createOrganization();
    const body = { name: 'My first draft' };
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/views`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user,
          [otherOrganization],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/GET view`, async () => {
    const organization = await createOrganization();
    const view = await viewService.save(
      View.create({
        name: 'my view',
        organizationId: organization.id,
        userId: authContext.user.id,
      }),
    );
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/views/${view.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user,
          [organization],
          keycloakAuthTestingGuard,
        ),
      );

    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(view.id);
  });

  it(`/GET view ${viewDoesNotBelongToOrga}`, async () => {
    const organization = await createOrganization();

    const view = await viewService.save(
      View.create({
        name: 'my view',
        organizationId: organization.id,
        userId: authContext.user.id,
      }),
    );
    const otherOrganization = await createOrganization();
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganization.id}/views/${view.id}`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.close();
    await dataSource.destroy();
  });
});
