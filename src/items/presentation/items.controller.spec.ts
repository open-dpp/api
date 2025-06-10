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
import { ItemOrgaUserMigrationService } from '../infrastructure/item-orga-user-migration.service';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { DataValue } from '../../passport/domain/passport';
import { ignoreIds } from '../../../test/utils';
import { SectionType } from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';

describe('ItemsController', () => {
  let app: INestApplication;
  let itemsService: ItemsService;
  let modelsService: ModelsService;
  let productDataModelService: ProductDataModelService;
  let organizationsService: OrganizationsService;
  let uniqueProductIdentifierService: UniqueProductIdentifierService;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());

  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@test.test');
  const organization = Organization.create({
    name: 'orga',
    user: authContext.user,
  });

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
      .overrideProvider(ItemOrgaUserMigrationService)
      .useValue({})
      .compile();

    modelsService = moduleRef.get(ModelsService);
    itemsService = moduleRef.get(ItemsService);
    productDataModelService = moduleRef.get(ProductDataModelService);
    uniqueProductIdentifierService = moduleRef.get(
      UniqueProductIdentifierService,
    );
    organizationsService = moduleRef.get(OrganizationsService);

    app = moduleRef.createNestApplication();

    await app.init();
  });

  const sectionId1 = randomUUID();
  const sectionId2 = randomUUID();
  const sectionId3 = randomUUID();
  const dataFieldId1 = randomUUID();
  const dataFieldId2 = randomUUID();
  const dataFieldId3 = randomUUID();
  const dataFieldId4 = randomUUID();
  const dataFieldId5 = randomUUID();

  const laptopModel = {
    name: 'Laptop',
    version: '1.0',
    ownedByOrganizationId: organization.id,
    createdByUserId: authContext.user.id,
    sections: [
      {
        id: sectionId1,
        name: 'Section name',
        type: SectionType.GROUP,
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            id: dataFieldId1,
            type: 'TextField',
            name: 'Title',
            options: { min: 2 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            id: dataFieldId2,
            type: 'TextField',
            name: 'Title 2',
            options: { min: 7 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
        ],
      },
      {
        id: sectionId2,
        name: 'Section name 2',
        type: SectionType.GROUP,
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            id: dataFieldId3,
            type: 'TextField',
            name: 'Title 3',
            options: { min: 8 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
        ],
      },
      {
        id: sectionId3,
        name: 'Repeating Section',
        type: SectionType.REPEATABLE,
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            id: dataFieldId4,
            type: 'TextField',
            name: 'Title 4',
            options: { min: 8 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            id: dataFieldId5,
            type: 'TextField',
            name: 'Title 5',
            options: { min: 8 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
        ],
      },
    ],
  };

  it(`/CREATE item`, async () => {
    const model = Model.create({
      name: 'name',
      userId: authContext.user.id,
      organizationId: organization.id,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    model.assignProductDataModel(productDataModel);
    await productDataModelService.save(productDataModel);
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
      dataValues: [
        {
          dataSectionId: sectionId1,
          dataFieldId: dataFieldId1,
          value: undefined,
        },
        {
          dataSectionId: sectionId1,
          dataFieldId: dataFieldId2,
          value: undefined,
        },
        {
          dataSectionId: sectionId2,
          dataFieldId: dataFieldId3,
          value: undefined,
        },
      ],
      productDataModelId: model.productDataModelId,
    });
  });

  it(`/CREATE item fails if user is not member of organization`, async () => {
    const otherOrganizationId = randomUUID();

    const model = Model.create({
      name: 'name',
      userId: authContext.user.id,
      organizationId: otherOrganizationId,
    });
    await modelsService.save(model);
    const response = await request(app.getHttpServer())
      .post(`/organizations/${otherOrganizationId}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/CREATE item fails if model does not belong to organization`, async () => {
    const otherOrganizationId = randomUUID();

    const model = Model.create({
      name: 'name',
      userId: authContext.user.id,
      organizationId: otherOrganizationId,
    });
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
    expect(response.status).toEqual(403);
  });

  it('add data values to item', async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const item = Item.create({ organizationId, userId });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    item.assignProductDataModel(productDataModel);
    await itemsService.save(item);
    const existingDataValues = item.dataValues;
    const addedValues = [
      {
        dataSectionId: sectionId3,
        dataFieldId: dataFieldId4,
        value: 'value 4',
        row: 0,
      },
      {
        dataSectionId: sectionId3,
        dataFieldId: dataFieldId5,
        value: 'value 5',
        row: 0,
      },
    ];
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/models/${randomUUID()}/items/${item.id}/data-values`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(addedValues);
    expect(response.status).toEqual(201);
    const expected = [
      ...existingDataValues,
      ...addedValues.map((d) => DataValue.create(d)),
    ];
    expect(response.body.dataValues).toEqual(ignoreIds(expected));

    const foundItem = await itemsService.findById(response.body.id);

    expect(foundItem.dataValues).toEqual(response.body.dataValues);
  });

  it('add data values to item fails if user is not member of organization', async () => {
    const otherOrganizationId = randomUUID();
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await itemsService.save(item);
    const addedValues = [];
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganizationId}/models/${randomUUID()}/items/${item.id}/data-values`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(addedValues);
    expect(response.status).toEqual(403);
  });

  it('add data values to item fails if item does not belong to organization', async () => {
    const otherOrganizationId = randomUUID();
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await itemsService.save(item);
    const addedValues = [];
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organization.id}/models/${randomUUID()}/items/${item.id}/data-values`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(addedValues);
    expect(response.status).toEqual(403);
  });

  it('update data values of item', async () => {
    const item = Item.create({
      organizationId: organization.id,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    item.assignProductDataModel(productDataModel);
    const dataValue1 = item.dataValues[0];
    const dataValue2 = item.dataValues[1];
    const dataValue3 = item.dataValues[2];
    const updatedValues = [
      {
        dataFieldId: dataValue1.dataFieldId,
        dataSectionId: dataValue1.dataSectionId,
        value: 'value 1',
      },
      {
        dataFieldId: dataValue3.dataFieldId,
        dataSectionId: dataValue3.dataSectionId,
        value: 'value 3',
      },
    ];
    await itemsService.save(item);
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organization.id}/models/${randomUUID()}/items/${item.id}/data-values`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(updatedValues);
    expect(response.status).toEqual(200);
    const expectedDataValues = [
      {
        ...dataValue1,
        value: 'value 1',
      },
      {
        ...dataValue2,
      },
      {
        ...dataValue3,
        value: 'value 3',
      },
    ];
    expect(response.body.dataValues).toEqual(expectedDataValues);
    const foundItem = await itemsService.findById(response.body.id);
    expect(foundItem.dataValues).toEqual(expectedDataValues);
  });

  it('update data values fails if user is not member of organization', async () => {
    const otherOrganizationId = randomUUID();
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await itemsService.save(item);
    const updatedValues = [
      {
        dataFieldId: randomUUID(),
        dataSectionId: randomUUID(),
        value: 'value 1',
      },
    ];

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrganizationId}/models/${randomUUID()}/items/${item.id}/data-values`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(updatedValues);
    expect(response.status).toEqual(403);
  });

  it('update data values fails if item does not belong to organization', async () => {
    const otherOrganizationId = randomUUID();
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await itemsService.save(item);
    const updatedValues = [
      {
        dataFieldId: randomUUID(),
        dataSectionId: randomUUID(),
        value: 'value 1',
      },
    ];

    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organization.id}/models/${randomUUID()}/items/${item.id}/data-values`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(updatedValues);
    expect(response.status).toEqual(403);
  });

  it(`/GET item`, async () => {
    const model = Model.create({
      name: 'name',
      userId: authContext.user.id,
      organizationId: organization.id,
    });
    await modelsService.save(model);
    const item = Item.create({
      organizationId: organization.id,
      userId: authContext.user.id,
    });
    item.defineModel(model);
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
      dataValues: [],
    });
  });
  //
  it(`/GET item fails if user is not member of organization`, async () => {
    const otherOrganizationId = randomUUID();
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });

    await itemsService.save(item);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id}/models/${randomUUID()}/items/${item.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET item fails if item does not belong to organization`, async () => {
    const otherOrganizationId = randomUUID();
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });

    await itemsService.save(item);
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(otherOrganization);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id}/models/${randomUUID()}/items/${item.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET all item`, async () => {
    const otherOrganizationId = randomUUID();
    const model = Model.create({
      name: 'name',
      userId: authContext.user.id,
      organizationId: otherOrganizationId,
    });
    await modelsService.save(model);
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    item.defineModel(model);
    const uniqueProductId1 = item.createUniqueProductIdentifier();
    await itemsService.save(item);
    const item2 = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    const uniqueProductId2 = item2.createUniqueProductIdentifier();
    item2.defineModel(model);
    await itemsService.save(item2);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [otherOrganizationId],
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
        dataValues: [],
      },
      {
        id: item2.id,
        uniqueProductIdentifiers: [
          {
            referenceId: item2.id,
            uuid: uniqueProductId2.uuid,
          },
        ],
        dataValues: [],
      },
    ]);
  });
  //
  it(`/GET all item fails if user is not member of organization`, async () => {
    const otherOrganizationId = randomUUID();
    const model = Model.create({
      name: 'name',
      userId: authContext.user.id,
      organizationId: otherOrganizationId,
    });
    await modelsService.save(model);
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    item.defineModel(model);
    await itemsService.save(item);
    const item2 = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    item2.defineModel(model);
    await itemsService.save(item2);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/models/${model.id}/items`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET all item fails if model do not belong to organization`, async () => {
    const otherOrganizationId = randomUUID();
    const model = Model.create({
      name: 'name',
      userId: authContext.user.id,
      organizationId: otherOrganizationId,
    });
    await modelsService.save(model);
    const item = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    item.defineModel(model);
    await itemsService.save(item);
    const item2 = Item.create({
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    item2.defineModel(model);
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
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
