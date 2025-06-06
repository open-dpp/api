import { INestApplication } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Test } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import * as request from 'supertest';
import { Model } from '../../models/domain/model';
import { ItemsService } from '../infrastructure/items.service';
import { ItemsModule } from '../items.module';
import { Item } from '../domain/item';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { UsersService } from '../../users/infrastructure/users.service';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import { PermissionsModule } from '../../permissions/permissions.module';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';

describe('ItemsController', () => {
  let app: INestApplication;
  let itemsService: ItemsService;
  let modelsService: ModelsService;
  let organizationsService: OrganizationsService;
  let uniqueProductIdentifierService: UniqueProductIdentifierService;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());

  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@test.test');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([UserEntity, OrganizationEntity]),
        MongooseTestingModule,
        ItemsModule,
        PermissionsModule,
      ],
      providers: [
        OrganizationsService,
        UsersService,
        {
          provide: APP_GUARD,
          useValue: keycloakAuthTestingGuard,
        },
        {
          provide: KeycloakResourcesService,
          useValue: KeycloakResourcesServiceTesting.fromPlain({
            users: [{ id: authContext.user.id, email: authContext.user.email }],
          }),
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

    modelsService = moduleRef.get(ModelsService);
    itemsService = moduleRef.get(ItemsService);
    uniqueProductIdentifierService = moduleRef.get(
      UniqueProductIdentifierService,
    );
    organizationsService = moduleRef.get(OrganizationsService);

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it(`/CREATE item`, async () => {
    const organization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(organization);
    const model = Model.create('name', authContext.user, organization);
    await modelsService.save(model);
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(201);
    const found = await itemsService.findById(response.body.id);
    const foundUniqueProductIdentifiers =
      await uniqueProductIdentifierService.findAllByReferencedId(found.id);
    expect(foundUniqueProductIdentifiers).toHaveLength(1);
    expect(response.body).toEqual({
      id: found.id,
      uniqueProductIdentifiers: [
        {
          uuid: foundUniqueProductIdentifiers[0].uuid,
          referenceId: found.id,
        },
      ],
    });
  });

  it(`/CREATE item fails if user is not member of organization`, async () => {
    const otherUser = new User(randomUUID(), 'other@example.com');
    const organization = Organization.create({
      name: 'My orga',
      user: otherUser,
    });
    await organizationsService.save(organization);

    const model = Model.create('name', otherUser, organization);
    await modelsService.save(model);
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      );
    expect(response.status).toEqual(403);
  });

  it(`/CREATE item fails if model does not belong to organization`, async () => {
    const organization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(organization);

    const model = Model.create('name', authContext.user, organization);
    await modelsService.save(model);
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(otherOrganization);
    const response = await request(app.getHttpServer())
      .post(`/organizations/${otherOrganization.id}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET item`, async () => {
    const organization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(organization);

    const model = Model.create('name', authContext.user, organization);
    await modelsService.save(model);
    const item = Item.create();
    item.defineModel(model.id);
    const uniqueProductId = item.createUniqueProductIdentifier();
    await itemsService.save(item);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id}/models/${model.id}/items/${item.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      id: item.id,
      uniqueProductIdentifiers: [
        {
          referenceId: item.id,
          uuid: uniqueProductId.uuid,
        },
      ],
    });
  });
  //
  it(`/GET item fails if user is not member of organization`, async () => {
    const otherUser = new User(randomUUID(), 'other@example.com');
    const organization = Organization.create({
      name: 'My orga',
      user: otherUser,
    });
    await organizationsService.save(organization);

    const model = Model.create('name', otherUser, organization);
    await modelsService.save(model);
    const item = Item.create();
    item.defineModel(model.id);
    await itemsService.save(item);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id}/models/${model.id}/items/${item.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET item fails if model does not belong to organization`, async () => {
    const organization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(organization);

    const model = Model.create('name', authContext.user, organization);
    await modelsService.save(model);
    const item = Item.create();
    item.defineModel(model.id);
    await itemsService.save(item);
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(otherOrganization);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${otherOrganization.id}/models/${model.id}/items/${item.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET all item`, async () => {
    const organization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(organization);
    const model = Model.create('name', authContext.user, organization);
    await modelsService.save(model);
    const item = Item.create();
    item.defineModel(model.id);
    const uniqueProductId1 = item.createUniqueProductIdentifier();
    await itemsService.save(item);
    const item2 = Item.create();
    const uniqueProductId2 = item2.createUniqueProductIdentifier();
    item2.defineModel(model.id);
    await itemsService.save(item2);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      {
        id: item.id,
        uniqueProductIdentifiers: [
          {
            referenceId: item.id,
            uuid: uniqueProductId1.uuid,
          },
        ],
      },
      {
        id: item2.id,
        uniqueProductIdentifiers: [
          {
            referenceId: item2.id,
            uuid: uniqueProductId2.uuid,
          },
        ],
      },
    ]);
  });
  //
  it(`/GET all item fails if user is not member of organization`, async () => {
    const otherUser = new User(randomUUID(), 'other@example.com');
    const organization = Organization.create({
      name: 'My orga',
      user: otherUser,
    });
    await organizationsService.save(organization);
    const model = Model.create('name', otherUser, organization);
    await modelsService.save(model);
    const item = Item.create();
    item.defineModel(model.id);
    await itemsService.save(item);
    const item2 = Item.create();
    item2.defineModel(model.id);
    await itemsService.save(item2);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET all item fails if model does not belong to organization`, async () => {
    const organization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(organization);
    const model = Model.create('name', authContext.user, organization);
    await modelsService.save(model);
    const item = Item.create();
    item.defineModel(model.id);
    await itemsService.save(item);
    const item2 = Item.create();
    item2.defineModel(model.id);
    await itemsService.save(item2);
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(otherOrganization);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganization.id}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      );
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
