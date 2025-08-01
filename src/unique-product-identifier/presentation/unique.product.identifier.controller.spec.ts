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
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import {
  phoneFactory,
  phoneItemFactory,
  phoneModelFactory,
} from '../../product-passport/fixtures/product-passport.factory';

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
  const authProps = { userId: authContext.user.id, organizationId };
  const phoneTemplate: TemplateDbProps = phoneFactory
    .addSections()
    .build(authProps);

  it(`/GET public view for unique product identifier`, async () => {
    const template = Template.loadFromDb({ ...phoneTemplate });
    await templateService.save(template);

    const model = Model.loadFromDb(
      phoneModelFactory
        .addDataValues()
        .build({ ...authProps, templateId: template.id }),
    );

    const item = Item.loadFromDb(
      phoneItemFactory
        .addDataValues()
        .build({ ...authProps, modelId: model.id, templateId: template.id }),
    );
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
    const template = Template.loadFromDb({ ...phoneTemplate });
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
    const template = Template.loadFromDb({ ...phoneTemplate });
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
