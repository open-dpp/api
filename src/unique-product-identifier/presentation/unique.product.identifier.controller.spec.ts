import { Test } from '@nestjs/testing';

import { AuthContext } from '../../auth/auth-request';

import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { TemplateService } from '../../templates/infrastructure/template.service';
import { TemplateModule } from '../../templates/template.module';
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
import { Template, TemplateDbProps } from '../../templates/domain/template';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { Item } from '../../items/domain/item';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ItemsService } from '../../items/infrastructure/items.service';
import { DataValue } from '../../product-passport/domain/data-value';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import { Layout } from '../../data-modelling/domain/layout';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { Sector } from '@open-dpp/api-client';

describe('UniqueProductIdentifierController', () => {
  let app: INestApplication;
  let modelsService: ModelsService;
  let itemsService: ItemsService;

  let templateService: TemplateService;
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
        TemplateModule,
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
    templateService = moduleRef.get<TemplateService>(TemplateService);

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

  const laptopModel: TemplateDbProps = {
    id: randomUUID(),
    marketplaceResourceId: null,
    description: 'My laptop',
    sectors: [Sector.ELECTRONICS],
    name: 'Laptop',
    version: '1.0',
    organizationId: organizationId,
    userId: authContext.user.id,
    sections: [
      {
        type: SectionType.REPEATABLE,
        id: sectionId1,
        parentId: undefined,
        name: 'Repeating Section',
        layout: Layout.create({
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        granularityLevel: GranularityLevel.MODEL,
        subSections: [sectionId2],
        dataFields: [
          {
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldId1,
            name: 'Title 1',
            options: { min: 2 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          },
          {
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldId2,
            name: 'Title 2',
            options: { min: 7 },
            layout: Layout.create({
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          },
        ],
      },
      {
        type: SectionType.REPEATABLE,
        id: sectionIdForItem1,
        parentId: undefined,
        name: 'Repeating Section for item',
        layout: Layout.create({
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        granularityLevel: GranularityLevel.ITEM,
        subSections: [sectionIdForItem2],
        dataFields: [
          {
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldIdForItem1,
            name: 'Title 1 for item',
            options: { min: 7 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldIdForItem2,
            name: 'Title 2 for item',
            options: { min: 7 },
            layout: Layout.create({
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.ITEM,
          },
        ],
      },
      {
        type: SectionType.GROUP,
        parentId: sectionId1,
        id: sectionId2,
        name: 'Group Section',
        subSections: [],
        layout: Layout.create({
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        granularityLevel: GranularityLevel.MODEL,
        dataFields: [
          {
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldId3,
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
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldId4,
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
        type: SectionType.GROUP,
        parentId: sectionIdForItem1,
        id: sectionIdForItem2,
        name: 'Group Section for item',
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
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldIdForItem3,
            name: 'Title 3 for item',
            options: { min: 8 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldIdForItem4,
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
        type: SectionType.GROUP,
        id: sectionId3,
        parentId: undefined,
        name: 'Group Section 2',
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
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldId5,
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
            type: DataFieldType.TEXT_FIELD,
            id: dataFieldIdForItem5,
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
    const template = Template.loadFromDb({ ...laptopModel });
    await templateService.save(template);

    const model = Model.loadFromDb({
      id: randomUUID(),
      name: 'Model Y',
      description: 'My desc',
      templateId: template.id,
      organizationId: organizationId,
      userId: authContext.user.id,
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
      templateId: template.id,
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

  it(`/GET reference of unique product identifier`, async () => {
    const template = Template.loadFromDb({ ...laptopModel });
    await templateService.save(template);
    const model = Model.create({
      name: 'model',
      userId: randomUUID(),
      organizationId: randomUUID(),
      template,
    });
    const item = Item.create({
      organizationId,
      userId: authContext.user.id,
      template,
      model,
    });
    const { uuid } = item.createUniqueProductIdentifier('externalId');
    await itemsService.save(item);

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/unique-product-identifiers/${uuid}/reference`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      id: item.id,
      organizationId,
      modelId: model.id,
      granularityLevel: GranularityLevel.ITEM,
    });
  });

  it(`/GET model reference of unique product identifier`, async () => {
    const template = Template.loadFromDb({ ...laptopModel });
    await templateService.save(template);
    const model = Model.create({
      name: 'model',
      userId: randomUUID(),
      organizationId: organizationId,
      template,
    });
    const { uuid } = model.createUniqueProductIdentifier();
    await modelsService.save(model);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/unique-product-identifiers/${uuid}/reference`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      id: model.id,
      organizationId,
      granularityLevel: GranularityLevel.MODEL,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
