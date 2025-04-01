import { Test } from '@nestjs/testing';

import { AuthContext } from '../../auth/auth-request';

import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { ProductDataModelModule } from '../../product-data-model/product.data.model.module';
import { UniqueProductIdentifierEntity } from '../infrastructure/unique.product.identifier.entity';
import { INestApplication } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from '../../models/infrastructure/model.entity';
import { ModelsModule } from '../../models/models.module';
import { UniqueProductIdentifierModule } from '../unique.product.identifier.module';
import { DataValue, Model } from '../../models/domain/model';
import * as request from 'supertest';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { SectionType } from '../../data-modelling/domain/section-base';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../../product-data-model/infrastructure/product-data-model.schema';

jest.mock('@keycloak/keycloak-admin-client', () => {
  return {
    __esModule: true, // Ensure Jest understands it's an ES module
    default: jest.fn(() => ({
      auth: jest.fn().mockResolvedValue(undefined),
      users: {
        find: jest.fn().mockResolvedValue([]), // Mock user retrieval returning empty array
        create: jest.fn().mockResolvedValue({ id: 'mock-user-id' }),
        update: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
      },
      realms: {
        find: jest
          .fn()
          .mockResolvedValue([{ id: 'mock-realm-id', realm: 'test-realm' }]),
      },
    })),
  };
});

describe('ModelsController', () => {
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
        TypeOrmModule.forFeature([
          ModelEntity,
          UserEntity,
          UniqueProductIdentifierEntity,
        ]),
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDoc.name,
            schema: ProductDataModelSchema,
          },
        ]),
        ModelsModule,
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
    })
      .overrideProvider(KeycloakResourcesService)
      .useValue(
        KeycloakResourcesServiceTesting.fromPlain({
          users: [{ id: authContext.user.id, email: authContext.user.email }],
        }),
      )
      .compile();

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

  const dataFieldId1 = randomUUID();
  const dataFieldId2 = randomUUID();
  const dataFieldId3 = randomUUID();
  const dataFieldId4 = randomUUID();

  const laptopModel = {
    name: 'Laptop',
    version: '1.0',
    sections: [
      {
        id: sectionId1,
        name: 'Group Section',
        type: SectionType.GROUP,
        dataFields: [
          {
            id: dataFieldId1,
            type: 'TextField',
            name: 'Title 1',
            options: { min: 2 },
          },
          {
            id: dataFieldId2,
            type: 'TextField',
            name: 'Title 2',
            options: { min: 7 },
          },
        ],
      },
      {
        id: sectionId2,
        name: 'Repeating Section',
        type: SectionType.REPEATABLE,
        dataFields: [
          {
            id: dataFieldId3,
            type: 'TextField',
            name: 'Title 3',
            options: { min: 8 },
          },
          {
            id: dataFieldId4,
            type: 'TextField',
            name: 'Title 4',
            options: { min: 8 },
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
          value: 'val1',
        }),
        DataValue.fromPlain({
          id: randomUUID(),
          dataFieldId: dataFieldId2,
          dataSectionId: sectionId1,
          value: 'val2',
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
      sections: [
        {
          name: 'Group Section',
          rows: [
            {
              fields: [
                { type: 'TextField', value: 'val1', name: 'Title 1' },
                { type: 'TextField', value: 'val2', name: 'Title 2' },
              ],
            },
          ],
        },
        {
          name: 'Repeating Section',
          rows: [
            {
              fields: [
                { type: 'TextField', value: 'val3,0', name: 'Title 3' },
                { type: 'TextField', value: 'val4,0', name: 'Title 4' },
              ],
            },
            {
              fields: [
                { type: 'TextField', value: 'val3,1', name: 'Title 3' },
                { type: 'TextField', value: 'val4,1', name: 'Title 4' },
              ],
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
