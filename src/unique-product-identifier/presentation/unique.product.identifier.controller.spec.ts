import { Test } from '@nestjs/testing';

import { AuthContext } from '../../auth/auth-request';

import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { ProductDataModelModule } from '../../product-data-model/product.data.model.module';
import { INestApplication } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueProductIdentifierModule } from '../unique.product.identifier.module';
import { DataValue, Model } from '../../models/domain/model';
import * as request from 'supertest';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { SectionType } from '../../data-modelling/domain/section-base';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';

jest.mock('@keycloak/keycloak-admin-client', () => {
  return {
    __esModule: true, // Ensure Jest understands it's an ES module
    default: jest.fn(() => ({
      auth: jest.fn().mockResolvedValue(undefined),
      users: {
        find: jest.fn().mockResolvedValue([]), // Mock user retrieval returning empty array
        findOne: jest.fn().mockResolvedValue({ id: 'mock-user-id' }),
        create: jest.fn().mockResolvedValue({ id: 'mock-user-id' }),
        update: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
        addToGroup: jest.fn().mockResolvedValue(undefined),
        listGroups: jest.fn().mockResolvedValue([{ id: 'mock-group-id' }]),
      },
      realms: {
        find: jest
          .fn()
          .mockResolvedValue([{ id: 'mock-realm-id', realm: 'test-realm' }]),
      },
      groups: {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'mock-group-id' }),
        update: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
      },
    })),
  };
});

describe('UniqueProductIdentifierController', () => {
  let app: INestApplication;
  let modelsService: ModelsService;
  let productDataModelService: ProductDataModelService;
  let organizationsService: OrganizationsService;
  const reflector: Reflector = new Reflector();
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), `${randomUUID()}@example.com`);

  beforeEach(() => {
    jest.spyOn(reflector, 'get').mockReturnValue(false);
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([UserEntity]),
        MongooseTestingModule,
        UniqueProductIdentifierModule,
        ProductDataModelModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: new KeycloakAuthTestingGuard(
            new Map([['token1', authContext.user]]),
            reflector,
          ),
        },
      ],
    }).compile();

    modelsService = moduleRef.get(ModelsService);
    organizationsService = moduleRef.get(OrganizationsService);
    productDataModelService = moduleRef.get<ProductDataModelService>(
      ProductDataModelService,
    );

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
    sections: [
      {
        id: sectionId1,
        name: 'Repeating Section',
        type: SectionType.REPEATABLE,
        layout: {
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        subSections: [sectionId2],
        dataFields: [
          {
            id: dataFieldId1,
            type: 'TextField',
            name: 'Title 1',
            options: { min: 2 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
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
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
        ],
      },
      {
        parentId: sectionId1,
        id: sectionId2,
        name: 'Group Section',
        type: SectionType.GROUP,
        subSections: [],
        layout: {
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
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
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
          {
            id: dataFieldId4,
            type: 'TextField',
            name: 'Title 4',
            options: { min: 8 },
            layout: {
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
        ],
      },
      {
        id: sectionId3,
        name: 'Group Section 2',
        type: SectionType.GROUP,
        subSections: [],
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            id: dataFieldId5,
            type: 'TextField',
            name: 'Title sg21',
            options: { min: 8 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
        ],
      },
    ],
  };

  it(`/GET public view for unique product identifier`, async () => {
    const productDataModel = ProductDataModel.fromPlain({ ...laptopModel });
    await productDataModelService.save(productDataModel);
    const organization = Organization.create({
      name: 'My orga',
      user: authContext.user,
    });
    await organizationsService.save(organization);
    const model = Model.fromPlain({
      name: 'Model Y',
      description: 'My desc',
      productDataModelId: productDataModel.id,
      ownedByOrganizationId: organization.id,
      createdByUserId: authContext.user.id,
      dataValues: [
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId1,
          dataSectionId: sectionId1,
          value: 'val1,0',
          row: 0,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId2,
          dataSectionId: sectionId1,
          value: 'val2,0',
          row: 0,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId3,
          dataSectionId: sectionId2,
          value: 'val3,0',
          row: 0,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId4,
          dataSectionId: sectionId2,
          value: 'val4,0',
          row: 0,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId1,
          dataSectionId: sectionId1,
          value: 'val1,1',
          row: 1,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId2,
          dataSectionId: sectionId1,
          value: 'val2,1',
          row: 1,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId3,
          dataSectionId: sectionId2,
          value: 'val3,1',
          row: 1,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId4,
          dataSectionId: sectionId2,
          value: 'val4,1',
          row: 1,
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId5,
          dataSectionId: sectionId3,
          value: 'val5,0',
          row: 0,
        }),
      ],
    });
    const { uuid } = model.createUniqueProductIdentifier();
    await modelsService.save(model);
    jest.spyOn(reflector, 'get').mockReturnValue(true);
    const response = await request(app.getHttpServer()).get(
      `/unique-product-identifiers/${uuid}/view`,
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      name: model.name,
      description: model.description,
      nodes: [
        {
          name: 'Repeating Section',
          rows: [
            {
              layout: {
                cols: { sm: 3 },
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
              children: [
                {
                  type: 'TextField',
                  value: 'val1,0',
                  name: 'Title 1',
                  layout: {
                    colStart: { sm: 1 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                },
                {
                  type: 'TextField',
                  value: 'val2,0',
                  name: 'Title 2',
                  layout: {
                    colStart: { sm: 2 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                },
                {
                  name: 'Group Section',
                  layout: {
                    cols: { sm: 3 },
                    colStart: { sm: 1 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                  children: [
                    {
                      type: 'TextField',
                      value: 'val3,0',
                      name: 'Title 3',
                      layout: {
                        colStart: { sm: 1 },
                        colSpan: { sm: 1 },
                        rowStart: { sm: 1 },
                        rowSpan: { sm: 1 },
                      },
                    },
                    {
                      type: 'TextField',
                      value: 'val4,0',
                      name: 'Title 4',
                      layout: {
                        colStart: { sm: 2 },
                        colSpan: { sm: 1 },
                        rowStart: { sm: 1 },
                        rowSpan: { sm: 1 },
                      },
                    },
                  ],
                },
              ],
            },
            {
              layout: {
                cols: { sm: 3 },
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
              children: [
                {
                  type: 'TextField',
                  value: 'val1,1',
                  name: 'Title 1',
                  layout: {
                    colStart: { sm: 1 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                },
                {
                  type: 'TextField',
                  value: 'val2,1',
                  name: 'Title 2',
                  layout: {
                    colStart: { sm: 2 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                },
                {
                  name: 'Group Section',
                  layout: {
                    cols: { sm: 3 },
                    colStart: { sm: 1 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                  children: [
                    {
                      type: 'TextField',
                      value: 'val3,1',
                      name: 'Title 3',
                      layout: {
                        colStart: { sm: 1 },
                        colSpan: { sm: 1 },
                        rowStart: { sm: 1 },
                        rowSpan: { sm: 1 },
                      },
                    },
                    {
                      type: 'TextField',
                      value: 'val4,1',
                      name: 'Title 4',
                      layout: {
                        colStart: { sm: 2 },
                        colSpan: { sm: 1 },
                        rowStart: { sm: 1 },
                        rowSpan: { sm: 1 },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'Group Section 2',
          layout: {
            cols: { sm: 2 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          children: [
            {
              type: 'TextField',
              value: 'val5,0',
              name: 'Title sg21',
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
          ],
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
