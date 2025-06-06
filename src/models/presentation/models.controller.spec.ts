import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ModelsModule } from '../models.module';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { ModelsService } from '../infrastructure/models.service';
import { AuthContext } from '../../auth/auth-request';
import { Model } from '../domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { ProductDataModelModule } from '../../product-data-model/product.data.model.module';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { OrganizationsModule } from '../../organizations/organizations.module';
import { NotFoundInDatabaseExceptionFilter } from '../../exceptions/exception.handler';
import { SectionType } from '../../data-modelling/domain/section-base';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';
import { DataValue } from '../../passport/passport';

describe('ModelsController', () => {
  let app: INestApplication;
  let uniqueProductIdentifierService: UniqueProductIdentifierService;
  let modelsService: ModelsService;
  let organizationsService: OrganizationsService;
  let productDataModelService: ProductDataModelService;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@example.com');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        MongooseTestingModule,
        ModelsModule,
        OrganizationsModule,
        ProductDataModelModule,
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

    uniqueProductIdentifierService = moduleRef.get(
      UniqueProductIdentifierService,
    );
    modelsService = moduleRef.get(ModelsService);
    productDataModelService = moduleRef.get<ProductDataModelService>(
      ProductDataModelService,
    );
    organizationsService =
      moduleRef.get<OrganizationsService>(OrganizationsService);

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new NotFoundInDatabaseExceptionFilter());

    await app.init();
  });

  async function createOrganization(user: User = authContext.user) {
    const organization = Organization.create({
      name: 'My orga',
      user: user,
    });
    return organizationsService.save(organization);
  }

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
          },
        ],
      },
    ],
  };

  it(`/CREATE model`, async () => {
    const body = { name: 'My name', description: 'My desc' };
    const organization = await createOrganization();
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/models`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(201);
    const found = await modelsService.findOne(response.body.id);
    expect(response.body.id).toEqual(found.id);
    expect(found.isOwnedBy(organization)).toBeTruthy();
    const foundUniqueProductIdentifiers =
      await uniqueProductIdentifierService.findAllByReferencedId(found.id);
    expect(foundUniqueProductIdentifiers).toHaveLength(1);
    for (const uniqueProductIdentifier of foundUniqueProductIdentifiers) {
      expect(uniqueProductIdentifier.referenceId).toEqual(found.id);
    }
    const sortFn = (a, b) => a.uuid.localeCompare(b.uuid);
    expect([...response.body.uniqueProductIdentifiers].sort(sortFn)).toEqual(
      [...foundUniqueProductIdentifiers].map((u) => u.toPlain()).sort(sortFn),
    );
  });

  it(`/CREATE model fails if user is not member of organization`, async () => {
    const body = { name: 'My name', description: 'My desc' };
    const otherUser = new User(randomUUID(), 'other@example.com');
    const organization = await createOrganization(otherUser);
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/models`)
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/GET models of organization`, async () => {
    const modelNames = ['P1', 'P2'];
    const organization = await createOrganization();

    const models: Model[] = await Promise.all(
      modelNames.map(async (pn) => {
        const model = Model.create({
          name: pn,
          organization,
          user: authContext.user,
        });
        return await modelsService.save(model);
      }),
    );
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(otherOrganization);
    await modelsService.save(
      Model.create({
        name: 'Other Orga',
        organization: otherOrganization,
        user: authContext.user,
      }),
    );

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/models`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);

    expect(response.body).toEqual(models.map((m) => m.toPlain()));
  });

  it(`/GET models of organization fails if user is not part of organization`, async () => {
    const otherUser = new User(randomUUID(), 'other@example.com');
    const organization = await createOrganization(otherUser);

    const model = Model.create({
      name: 'Model',
      organization,
      user: otherUser,
    });
    await modelsService.save(model);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/models`)
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

  it(`/GET model`, async () => {
    const organization = await createOrganization();
    const model = Model.create({
      name: 'Model',
      organization,
      user: authContext.user,
    });
    await modelsService.save(model);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/models/${model.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(model.toPlain());
  });

  it(`/GET model fails if user is not member of organization`, async () => {
    const otherUser = new User(randomUUID(), 'test@example.com');
    const organization = await createOrganization(otherUser);
    const model = Model.create({
      name: 'Model',
      organization,
      user: otherUser,
    });
    await modelsService.save(model);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/models/${model.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET model fails if model does not belong to organization`, async () => {
    const organization = await createOrganization();
    const model = Model.create({
      name: 'Model',
      organization,
      user: authContext.user,
    });
    await modelsService.save(model);
    const otherOrganization = await createOrganization();
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganization.id}/models/${model.id}`)
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

  it('assigns product data model to model', async () => {
    const body = { name: 'My name', description: 'My desc' };
    const organization = await createOrganization();

    const model = Model.create({
      name: 'My name',
      organization,
      user: authContext.user,
    });
    await modelsService.save(model);

    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);

    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organization.id}/models/${model.id}/product-data-models/${productDataModel.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(201);
    const responseGet = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/models/${model.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      );
    expect(responseGet.body.dataValues).toEqual([
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: sectionId1,
        dataFieldId: dataFieldId1,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: sectionId1,
        dataFieldId: dataFieldId2,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: sectionId2,
        dataFieldId: dataFieldId3,
      }),
    ]);
    expect(responseGet.body.productDataModelId).toEqual(productDataModel.id);
  });

  it('assigns product data model to model fails if user is not member of organization', async () => {
    const body = { name: 'My name', description: 'My desc' };
    const otherUser = new User(randomUUID(), 'other@example.com');
    const organization = await createOrganization(otherUser);

    const model = Model.create({
      name: 'My name',
      organization,
      user: otherUser,
    });
    await modelsService.save(model);

    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);

    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organization.id}/models/${model.id}/product-data-models/${productDataModel.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it('assigns product data model to model fails if model does not belong to organization', async () => {
    const body = { name: 'My name', description: 'My desc' };
    const organization = await createOrganization();

    const model = Model.create({
      name: 'My name',
      organization,
      user: authContext.user,
    });
    await modelsService.save(model);

    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);

    const otherOrganization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(otherOrganization);

    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganization.id}/models/${model.id}/product-data-models/${productDataModel.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  //
  it('update data values of model', async () => {
    const organization = await createOrganization();

    const model = Model.create({
      name: 'My name',
      organization,
      user: authContext.user,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const dataValue1 = model.dataValues[0];
    const dataValue2 = model.dataValues[1];
    const dataValue3 = model.dataValues[2];
    const updatedValues = [
      { id: dataValue1.id, value: 'value 1' },
      { id: dataValue3.id, value: 'value 3' },
    ];
    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/models/${model.id}/data-values`)
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
    const foundModel = await modelsService.findOne(response.body.id);
    const sortFn = (a, b) => a.id.localeCompare(b.id);
    expect([...foundModel.dataValues].sort(sortFn)).toEqual(
      [...expectedDataValues].sort(sortFn),
    );
  });

  it('update data values fails if user is not member of organization', async () => {
    const otherUser = new User(randomUUID(), 'test@example.com');
    const organization = await createOrganization(otherUser);

    const model = Model.create({
      name: 'My name',
      organization,
      user: otherUser,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const dataValue1 = model.dataValues[0];
    const updatedValues = [{ id: dataValue1.id, value: 'value 1' }];
    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/models/${model.id}/data-values`)
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      )
      .send(updatedValues);
    expect(response.status).toEqual(403);
  });

  it('update data values fails if model does not belong to organization', async () => {
    const organization = await createOrganization();

    const model = Model.create({
      name: 'My name',
      organization: organization,
      user: authContext.user,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(otherOrganization);
    const dataValue1 = model.dataValues[0];
    const updatedValues = [{ id: dataValue1.id, value: 'value 1' }];
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrganization.id}/models/${model.id}/data-values`,
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

  //
  it('update data values fails caused by validation', async () => {
    const organization = await createOrganization();

    const model = Model.create({
      name: 'My name',
      organization: organization,
      user: authContext.user,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const dataValue1 = model.dataValues[0];
    const dataValue3 = model.dataValues[2];
    const updatedValues = [
      { id: dataValue1.id, value: { wrongValue: 'value 1' } },
      { id: dataValue3.id, value: 'value 3' },
    ];
    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organization.id}/models/${model.id}/data-values`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(updatedValues);
    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      errors: [
        {
          id: dataFieldId1,
          message: 'Expected string, received object',
          name: 'Title',
        },
      ],
      isValid: false,
    });
  });
  //
  it('add data values to model', async () => {
    const organization = await createOrganization();
    const model = Model.create({
      name: 'My name',
      organization,
      user: authContext.user,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const existingDataValues = model.dataValues;
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
      .post(`/organizations/${organization.id}/models/${model.id}/data-values`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id],
          keycloakAuthTestingGuard,
        ),
      )
      .send(addedValues);
    expect(response.status).toEqual(201);
    const expected = [
      ...existingDataValues,
      ...addedValues.map((value) => ({ id: expect.any(String), ...value })),
    ];
    expect(response.body.dataValues).toEqual(expected);

    const foundModel = await modelsService.findOne(response.body.id);
    const sortFn = (a, b) => {
      return a.id.localeCompare(b.id);
    };
    expect([...foundModel.dataValues].sort(sortFn)).toEqual(
      [...response.body.dataValues].sort(sortFn),
    );
  });

  it('add data values to model fails if user is not member of organization', async () => {
    const otherUser = new User(randomUUID(), 'test@example.com');
    const organization = await createOrganization(otherUser);
    const model = Model.create({
      name: 'My name',
      organization,
      user: otherUser,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const addedValues = [];
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/models/${model.id}/data-values`)
      .set(
        'Authorization',
        getKeycloakAuthToken(authContext.user.id, [], keycloakAuthTestingGuard),
      )
      .send(addedValues);
    expect(response.status).toEqual(403);
  });

  it('add data values to model fails if model does not belong to organization', async () => {
    const organization = await createOrganization();
    const model = Model.create({
      name: 'My name',
      organization,
      user: authContext.user,
    });
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    const otherOrganization = await createOrganization();
    await modelsService.save(model);
    const addedValues = [];
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganization.id}/models/${model.id}/data-values`,
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

  //
  // it('add data values to model fails due to validation errors', async () => {
  //   const model = Model.fromPlain({ name: 'My name', description: 'My desc' });
  //   model.assignOwner(authContext.user);
  //   const productDataModel = ProductDataModel.fromPlain(laptopModel);
  //   await productDataModelService.save(productDataModel);
  //   model.assignProductDataModel(productDataModel);
  //   await modelsService.save(model);
  //   const addedValues = [
  //     {
  //       dataSectionId: sectionId3,
  //       dataFieldId: dataFieldId4,
  //       value: { invalid: 'field' },
  //       row: 0,
  //     },
  //     {
  //       dataSectionId: sectionId3,
  //       dataFieldId: dataFieldId5,
  //       value: 'value 5',
  //       row: 0,
  //     },
  //   ];
  //   const response = await request(app.getHttpServer())
  //     .post(`/models/${model.id}/data-values`)
  //     .set('Authorization', 'Bearer token1')
  //     .send(addedValues);
  //   expect(response.status).toEqual(400);
  //   expect(response.body).toEqual({
  //     errors: [
  //       {
  //         id: dataFieldId4,
  //         message: 'Expected string, received object',
  //         name: 'Title 4',
  //       },
  //     ],
  //     isValid: false,
  //   });
  // });

  afterAll(async () => {
    await app.close();
  });
});
