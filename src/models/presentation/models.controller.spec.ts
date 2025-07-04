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
import {
  ProductDataModel,
  ProductDataModelDbProps,
  VisibilityLevel,
} from '../../product-data-model/domain/product.data.model';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { ProductDataModelModule } from '../../product-data-model/product.data.model.module';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationsModule } from '../../organizations/organizations.module';
import { NotFoundInDatabaseExceptionFilter } from '../../exceptions/exception.handler';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';
import { modelToDto } from './dto/model.dto';
import { ignoreIds } from '../../../test/utils';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';
import { uniqueProductIdentifierToDto } from '../../unique-product-identifier/presentation/dto/unique-product-identifier-dto.schema';
import {
  GroupSection,
  RepeaterSection,
} from '../../product-data-model/domain/section';
import { Layout } from '../../data-modelling/domain/layout';
import { TextField } from '../../product-data-model/domain/data-field';

describe('ModelsController', () => {
  let app: INestApplication;
  let uniqueProductIdentifierService: UniqueProductIdentifierService;
  let modelsService: ModelsService;
  let productDataModelService: ProductDataModelService;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({
    name: 'orga',
    user: authContext.user,
  });

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

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new NotFoundInDatabaseExceptionFilter());

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

  const laptopModel: ProductDataModelDbProps = {
    id: randomUUID(),
    createdByUserId: randomUUID(),
    ownedByOrganizationId: organization.id,
    visibility: VisibilityLevel.PRIVATE,
    name: 'Laptop',
    version: '1.0',
    sections: [
      GroupSection.loadFromDb({
        id: sectionId1,
        parentId: undefined,
        subSections: [],
        name: 'Section name',
        layout: Layout.create({
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: dataFieldId1,
            name: 'Title',
            options: { min: 2 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: dataFieldId2,
            name: 'Title 2',
            options: { min: 7 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
      }),
      GroupSection.loadFromDb({
        id: sectionId2,
        parentId: undefined,
        subSections: [],
        name: 'Section name 2',
        layout: Layout.create({
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: dataFieldId3,
            name: 'Title 3',
            options: { min: 8 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
      }),
      RepeaterSection.loadFromDb({
        id: sectionId3,
        parentId: undefined,
        subSections: [],
        name: 'Repeating Section',
        layout: Layout.create({
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: dataFieldId4,
            name: 'Title 4',
            options: { min: 8 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: dataFieldId5,
            name: 'Title 5',
            options: { min: 8 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
      }),
    ],
  };

  it(`/CREATE model`, async () => {
    const body = { name: 'My name', description: 'My desc' };
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
    const found = await modelsService.findOneOrFail(response.body.id);
    expect(response.body.id).toEqual(found.id);
    expect(found.isOwnedBy(organization.id)).toBeTruthy();
    const foundUniqueProductIdentifiers =
      await uniqueProductIdentifierService.findAllByReferencedId(found.id);
    expect(foundUniqueProductIdentifiers).toHaveLength(1);
    for (const uniqueProductIdentifier of foundUniqueProductIdentifiers) {
      expect(uniqueProductIdentifier.referenceId).toEqual(found.id);
    }
    const sortFn = (a, b) => a.uuid.localeCompare(b.uuid);
    expect([...response.body.uniqueProductIdentifiers].sort(sortFn)).toEqual(
      [...foundUniqueProductIdentifiers]
        .map((u) => uniqueProductIdentifierToDto(u))
        .sort(sortFn),
    );
  });

  it(`/CREATE model fails if user is not member of organization`, async () => {
    const body = { name: 'My name', description: 'My desc' };
    const otherOrganizationId = randomUUID();
    const response = await request(app.getHttpServer())
      .post(`/organizations/${otherOrganizationId}/models`)
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

  it(`/GET models of organization`, async () => {
    const modelNames = ['P1', 'P2'];
    const otherOrganizationId = randomUUID();
    const models: Model[] = await Promise.all(
      modelNames.map(async (pn) => {
        const model = Model.create({
          name: pn,
          organizationId: otherOrganizationId,
          userId: authContext.user.id,
        });
        return await modelsService.save(model);
      }),
    );
    await modelsService.save(
      Model.create({
        name: 'Other Orga',
        organizationId: organization.id,
        userId: authContext.user.id,
      }),
    );

    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/models`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organization.id, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);

    expect(response.body).toEqual(models.map((m) => modelToDto(m)));
  });

  it(`/GET models of organization fails if user is not part of organization`, async () => {
    const otherOrganizationId = randomUUID();

    const model = Model.create({
      name: 'Model',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await modelsService.save(model);

    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/models`)
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
    const model = Model.create({
      name: 'Model',
      organizationId: organization.id,
      userId: authContext.user.id,
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
    expect(response.body).toEqual(modelToDto(model));
  });

  it(`/GET model fails if user is not member of organization`, async () => {
    const otherOrganizationId = randomUUID();
    const model = Model.create({
      name: 'Model',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await modelsService.save(model);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/models/${model.id}`)
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

  it(`/GET model fails if model does not belong to organization`, async () => {
    const otherOrganizationId = randomUUID();
    const model = Model.create({
      name: 'Model',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
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
    expect(response.status).toEqual(403);
  });

  it('assigns product data model to model', async () => {
    const body = { name: 'My name', description: 'My desc' };

    const model = Model.create({
      name: 'My name',
      organizationId: organization.id,
      userId: authContext.user.id,
    });
    await modelsService.save(model);

    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
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
    expect(responseGet.body.dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: sectionId1,
          dataFieldId: dataFieldId1,
          value: undefined,
          row: 0,
        }),
        DataValue.create({
          dataSectionId: sectionId1,
          dataFieldId: dataFieldId2,
          value: undefined,
          row: 0,
        }),
        DataValue.create({
          dataSectionId: sectionId2,
          dataFieldId: dataFieldId3,
          value: undefined,
          row: 0,
        }),
      ]),
    );
    expect(responseGet.body.productDataModelId).toEqual(productDataModel.id);
  });

  it('assigns product data model to model fails if user is not member of organization', async () => {
    const body = { name: 'My name', description: 'My desc' };
    const otherOrganizationId = randomUUID();

    const model = Model.create({
      name: 'My name',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await modelsService.save(model);

    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    await productDataModelService.save(productDataModel);

    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganizationId}/models/${model.id}/product-data-models/${productDataModel.id}`,
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

  it('assigns product data model to model fails if model does not belong to organization', async () => {
    const body = { name: 'My name', description: 'My desc' };
    const otherOrganizationId = randomUUID();

    const model = Model.create({
      name: 'My name',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    await modelsService.save(model);

    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
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
    expect(response.status).toEqual(403);
  });

  //
  it('update data values of model', async () => {
    const model = Model.create({
      name: 'My name',
      organizationId: organization.id,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const dataValue1 = model.dataValues[0];
    const dataValue2 = model.dataValues[1];
    const dataValue3 = model.dataValues[2];
    const updatedValues = [
      {
        dataFieldId: dataValue1.dataFieldId,
        dataSectionId: dataValue1.dataSectionId,
        value: 'value 1',
        row: 0,
      },
      {
        dataFieldId: dataValue3.dataFieldId,
        dataSectionId: dataValue3.dataSectionId,
        value: 'value 3',
        row: 0,
      },
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
        row: 0,
      },
      {
        ...dataValue2,
        row: 0,
      },
      {
        ...dataValue3,
        value: 'value 3',
        row: 0,
      },
    ];
    expect(response.body.dataValues).toEqual(expectedDataValues);
    const foundModel = await modelsService.findOneOrFail(response.body.id);
    expect(foundModel.dataValues).toEqual(expectedDataValues);
  });

  it('update data values fails if user is not member of organization', async () => {
    const otherOrganizationId = randomUUID();
    const model = Model.create({
      name: 'My name',
      organizationId: organization.id,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const dataValue1 = model.dataValues[0];
    const updatedValues = [
      {
        dataFieldId: dataValue1.dataFieldId,
        dataSectionId: dataValue1.dataSectionId,
        value: 'value 1',
        row: 0,
      },
    ];
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrganizationId}/models/${model.id}/data-values`,
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

  it('update data values fails if model does not belong to organization', async () => {
    const otherOrganizationId = randomUUID();

    const model = Model.create({
      name: 'My name',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const dataValue1 = model.dataValues[0];
    const updatedValues = [
      {
        dataFieldId: dataValue1.dataFieldId,
        dataSectionId: dataValue1.dataSectionId,
        value: 'value 1',
        row: 0,
      },
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
    expect(response.status).toEqual(403);
  });

  //
  it('update data values fails caused by validation', async () => {
    const model = Model.create({
      name: 'My name',
      organizationId: organization.id,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const dataValue1 = model.dataValues[0];
    const dataValue3 = model.dataValues[2];
    const updatedValues = [
      {
        dataFieldId: dataValue1.dataFieldId,
        dataSectionId: dataValue1.dataSectionId,
        value: { wrongValue: 'value 1' },
        row: 0,
      },
      {
        dataFieldId: dataValue3.dataFieldId,
        dataSectionId: dataValue3.dataSectionId,
        value: 'value 3',
        row: 0,
      },
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
          message: 'Invalid input: expected string, received object',
          name: 'Title',
        },
      ],
      isValid: false,
    });
  });
  //
  it('add data values to model', async () => {
    const model = Model.create({
      name: 'My name',
      organizationId: organization.id,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
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
      ...addedValues.map((d) => DataValue.create(d)),
    ];
    expect(response.body.dataValues).toEqual(ignoreIds(expected));

    const foundModel = await modelsService.findOneOrFail(response.body.id);

    expect(foundModel.dataValues).toEqual(response.body.dataValues);
  });

  it('add data values to model fails if user is not member of organization', async () => {
    const otherOrganizationId = randomUUID();
    const model = Model.create({
      name: 'My name',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const addedValues = [];
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganizationId}/models/${model.id}/data-values`,
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

  it('add data values to model fails if model does not belong to organization', async () => {
    const otherOrganizationId = randomUUID();

    const model = Model.create({
      name: 'My name',
      organizationId: otherOrganizationId,
      userId: authContext.user.id,
    });
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    await productDataModelService.save(productDataModel);
    model.assignProductDataModel(productDataModel);
    await modelsService.save(model);
    const addedValues = [];
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
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
