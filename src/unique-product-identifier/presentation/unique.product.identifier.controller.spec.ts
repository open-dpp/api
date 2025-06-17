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
import { Model } from '../../models/domain/model';
import * as request from 'supertest';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { SectionType } from '../../data-modelling/domain/section-base';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { Item } from '../../items/domain/item';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ItemsService } from '../../items/infrastructure/items.service';
import { DataValue } from '../../product-passport/domain/data-value';

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
  let itemsService: ItemsService;

  let productDataModelService: ProductDataModelService;
  const reflector: Reflector = new Reflector();
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(
    new Map(),
    reflector,
  );
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), `${randomUUID()}@example.com`);
  const organizationId = randomUUID();

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
          useValue: keycloakAuthTestingGuard,
        },
      ],
    }).compile();

    modelsService = moduleRef.get(ModelsService);
    itemsService = moduleRef.get(ItemsService);
    productDataModelService = moduleRef.get<ProductDataModelService>(
      ProductDataModelService,
    );

    app = moduleRef.createNestApplication();

    await app.init();
  });

  const sectionId1 = randomUUID();
  const sectionId2 = randomUUID();
  const sectionId3 = randomUUID();

  const sectionIdForItem1 = randomUUID();
  const sectionIdForItem2 = randomUUID();

  const dataFieldId1 = randomUUID();
  const dataFieldId2 = randomUUID();
  const dataFieldId3 = randomUUID();
  const dataFieldId4 = randomUUID();
  const dataFieldId5 = randomUUID();

  const dataFieldIdForItem1 = randomUUID();
  const dataFieldIdForItem2 = randomUUID();
  const dataFieldIdForItem3 = randomUUID();
  const dataFieldIdForItem4 = randomUUID();
  const dataFieldIdForItem5 = randomUUID();

  const laptopModel = {
    name: 'Laptop',
    version: '1.0',
    ownedByOrganizationId: organizationId,
    createdByUserId: authContext.user.id,
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
        granularityLevel: GranularityLevel.MODEL,
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
            granularityLevel: GranularityLevel.MODEL,
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
            granularityLevel: GranularityLevel.MODEL,
          },
        ],
      },
      {
        id: sectionIdForItem1,
        name: 'Repeating Section for item',
        type: SectionType.REPEATABLE,
        layout: {
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        granularityLevel: GranularityLevel.ITEM,
        subSections: [sectionIdForItem2],
        dataFields: [
          {
            id: dataFieldIdForItem1,
            type: 'TextField',
            name: 'Title 1 for item',
            options: { min: 7 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            id: dataFieldIdForItem2,
            type: 'TextField',
            name: 'Title 2 for item',
            options: { min: 7 },
            layout: {
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
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
        granularityLevel: GranularityLevel.MODEL,
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
            granularityLevel: GranularityLevel.MODEL,
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
            granularityLevel: GranularityLevel.MODEL,
          },
        ],
      },
      {
        parentId: sectionIdForItem1,
        id: sectionIdForItem2,
        name: 'Group Section for item',
        type: SectionType.GROUP,
        subSections: [],
        layout: {
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        granularityLevel: GranularityLevel.ITEM,
        dataFields: [
          {
            id: dataFieldIdForItem3,
            type: 'TextField',
            name: 'Title 3 for item',
            options: { min: 8 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            id: dataFieldIdForItem4,
            type: 'TextField',
            name: 'Title 4 for item',
            options: { min: 8 },
            layout: {
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
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
            granularityLevel: GranularityLevel.MODEL,
          },
          {
            id: dataFieldIdForItem5,
            type: 'TextField',
            name: 'Title sg21 for item',
            options: { min: 8 },
            layout: {
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.ITEM,
          },
        ],
      },
    ],
  };

  it(`/GET public view for unique product identifier`, async () => {
    const productDataModel = ProductDataModel.fromPlain({ ...laptopModel });
    await productDataModelService.save(productDataModel);

    const model = Model.loadFromDb({
      id: randomUUID(),
      name: 'Model Y',
      description: 'My desc',
      productDataModelId: productDataModel.id,
      ownedByOrganizationId: organizationId,
      createdByUserId: authContext.user.id,
      uniqueProductIdentifiers: [],
      dataValues: [
        DataValue.create({
          dataFieldId: dataFieldId1,
          dataSectionId: sectionId1,
          value: 'val1,0',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldId2,
          dataSectionId: sectionId1,
          value: 'val2,0',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldId3,
          dataSectionId: sectionId2,
          value: 'val3,0',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldId4,
          dataSectionId: sectionId2,
          value: 'val4,0',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldId1,
          dataSectionId: sectionId1,
          value: 'val1,1',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldId2,
          dataSectionId: sectionId1,
          value: 'val2,1',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldId3,
          dataSectionId: sectionId2,
          value: 'val3,1',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldId4,
          dataSectionId: sectionId2,
          value: 'val4,1',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldId5,
          dataSectionId: sectionId3,
          value: 'val5,0',
          row: 0,
        }),
      ],
    });

    const item = Item.loadFromDb({
      id: randomUUID(),
      productDataModelId: productDataModel.id,
      organizationId: organizationId,
      userId: authContext.user.id,
      modelId: model.id,
      uniqueProductIdentifiers: [],
      dataValues: [
        DataValue.create({
          dataFieldId: dataFieldIdForItem1,
          dataSectionId: sectionIdForItem1,
          value: 'val1,0,item',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem2,
          dataSectionId: sectionIdForItem1,
          value: 'val2,0,item',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem3,
          dataSectionId: sectionIdForItem2,
          value: 'val3,0,item',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem4,
          dataSectionId: sectionIdForItem2,
          value: 'val4,0,item',
          row: 0,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem1,
          dataSectionId: sectionIdForItem1,
          value: 'val1,1,item',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem2,
          dataSectionId: sectionIdForItem1,
          value: 'val2,1,item',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem3,
          dataSectionId: sectionIdForItem2,
          value: 'val3,1,item',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem4,
          dataSectionId: sectionIdForItem2,
          value: 'val4,1,item',
          row: 1,
        }),
        DataValue.create({
          dataFieldId: dataFieldIdForItem5,
          dataSectionId: sectionId3,
          value: 'val5,0,item',
          row: 0,
        }),
      ],
    });
    const { uuid: modelUUID } = model.createUniqueProductIdentifier();
    const { uuid } = item.createUniqueProductIdentifier();
    await itemsService.save(item);
    await modelsService.save(model);
    jest.spyOn(reflector, 'get').mockReturnValue(true);
    let response = await request(app.getHttpServer()).get(
      `/unique-product-identifiers/${uuid}/view`,
    );
    expect(response.status).toEqual(200);

    const expectedNode1 = {
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
    };
    const expectedNode2 = {
      name: 'Repeating Section for item',
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
              value: 'val1,0,item',
              name: 'Title 1 for item',
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
            {
              type: 'TextField',
              value: 'val2,0,item',
              name: 'Title 2 for item',
              layout: {
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
            {
              name: 'Group Section for item',
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
                  value: 'val3,0,item',
                  name: 'Title 3 for item',
                  layout: {
                    colStart: { sm: 1 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                },
                {
                  type: 'TextField',
                  value: 'val4,0,item',
                  name: 'Title 4 for item',
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
              value: 'val1,1,item',
              name: 'Title 1 for item',
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
            {
              type: 'TextField',
              value: 'val2,1,item',
              name: 'Title 2 for item',
              layout: {
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
            {
              name: 'Group Section for item',
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
                  value: 'val3,1,item',
                  name: 'Title 3 for item',
                  layout: {
                    colStart: { sm: 1 },
                    colSpan: { sm: 1 },
                    rowStart: { sm: 1 },
                    rowSpan: { sm: 1 },
                  },
                },
                {
                  type: 'TextField',
                  value: 'val4,1,item',
                  name: 'Title 4 for item',
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
    };
    const expectedNode3 = {
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
        {
          type: 'TextField',
          value: 'val5,0,item',
          name: 'Title sg21 for item',
          layout: {
            colStart: { sm: 2 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
        },
      ],
    };

    expect(response.body).toEqual({
      name: model.name,
      description: model.description,
      nodes: [expectedNode1, expectedNode2, expectedNode3],
    });

    response = await request(app.getHttpServer()).get(
      `/unique-product-identifiers/${modelUUID}/view`,
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      name: model.name,
      description: model.description,
      nodes: [
        expectedNode1,
        {
          ...expectedNode3,
          children: expectedNode3.children.slice(0, 1),
        },
      ],
    });
  });

  it(`/GET unique product identifier`, async () => {
    const productDataModel = ProductDataModel.fromPlain({ ...laptopModel });
    await productDataModelService.save(productDataModel);
    const item = Item.create({ organizationId, userId: authContext.user.id });
    const { uuid } = item.createUniqueProductIdentifier('externalId');
    await itemsService.save(item);

    jest.spyOn(reflector, 'get').mockReturnValue(true);
    const response = await request(app.getHttpServer()).get(
      `/unique-product-identifiers/${uuid}`,
    );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      uuid: uuid,
      referenceId: item.id,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
