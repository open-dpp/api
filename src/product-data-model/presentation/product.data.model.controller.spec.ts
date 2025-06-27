import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModelService } from '../infrastructure/product-data-model.service';
import { ProductDataModelModule } from '../product.data.model.module';
import {
  ProductDataModel,
  ProductDataModelDbProps,
  VisibilityLevel,
} from '../domain/product.data.model';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../infrastructure/product-data-model.schema';
import { Connection } from 'mongoose';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { GroupSection } from '../domain/section';
import { Layout } from '../../data-modelling/domain/layout';
import { TextField } from '../domain/data-field';
import { productDataModelToDto } from './dto/product-data-model.dto';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';

describe('ProductsDataModelController', () => {
  let app: INestApplication;
  let service: ProductDataModelService;
  let mongoConnection: Connection;

  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@test.test');
  const organizationId = randomUUID();
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDoc.name,
            schema: ProductDataModelSchema,
          },
        ]),
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

    service = moduleRef.get<ProductDataModelService>(ProductDataModelService);
    mongoConnection = moduleRef.get<Connection>(getConnectionToken());
    app = moduleRef.createNestApplication();

    await app.init();
  });

  const laptopPlain: ProductDataModelDbProps = {
    id: randomUUID(),
    version: '1.0',
    name: 'Laptop',
    visibility: VisibilityLevel.PRIVATE,
    ownedByOrganizationId: organizationId,
    createdByUserId: authContext.user.id,
    sections: [
      GroupSection.loadFromDb({
        id: randomUUID(),
        parentId: undefined,
        subSections: [],
        name: 'Section 1',
        layout: Layout.create({
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 3 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 3 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: randomUUID(),
            name: 'Title',
            options: { min: 2 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: randomUUID(),
            name: 'Title 2',
            options: { min: 2 },
            layout: Layout.create({
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
      }),
    ],
  };

  const userHasNotThePermissionsTxt = `fails if user has not the permissions`;

  it(`/GET product data model`, async () => {
    const productDataModel = ProductDataModel.loadFromDb({ ...laptopPlain });

    await service.save(productDataModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models/${productDataModel.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(productDataModelToDto(productDataModel));
  });

  it(`/GET product data model ${userHasNotThePermissionsTxt}`, async () => {
    const otherOrganizationId = randomUUID();
    const productDataModel = ProductDataModel.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId: randomUUID(),
    });
    await service.save(productDataModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models/${productDataModel.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send();
    expect(response.status).toEqual(403);
  });

  it(`/GET product data model if it is public`, async () => {
    const otherOrganizationId = randomUUID();
    const productDataModel = ProductDataModel.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId: randomUUID(),
      visibility: VisibilityLevel.PUBLIC,
    });
    await service.save(productDataModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models/${productDataModel.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send();
    expect(response.status).toEqual(200);
  });

  it(`/GET all product data models which belong to the organization or which are public`, async () => {
    const otherOrganizationId = randomUUID();
    const laptopModel = ProductDataModel.loadFromDb({
      ...laptopPlain,
    });
    const phoneModel = ProductDataModel.loadFromDb({
      ...laptopPlain,
      id: randomUUID(),
      name: 'phone',
    });
    const publicModel = ProductDataModel.create({
      name: 'publicModel',
      userId: randomUUID(),
      organizationId: otherOrganizationId,
      visibility: VisibilityLevel.PUBLIC,
    });
    const notAccessibleModel = ProductDataModel.create({
      name: 'privateModel',
      userId: randomUUID(),
      organizationId: otherOrganizationId,
      visibility: VisibilityLevel.PRIVATE,
    });

    await service.save(laptopModel);
    await service.save(phoneModel);
    await service.save(publicModel);
    await service.save(notAccessibleModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models?organization=${organizationId}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);

    expect(response.body).toContainEqual({
      id: laptopModel.id,
      name: laptopModel.name,
      version: laptopModel.version,
    });
    expect(response.body).toContainEqual({
      id: phoneModel.id,
      name: phoneModel.name,
      version: phoneModel.version,
    });
    expect(response.body).toContainEqual({
      id: publicModel.id,
      name: publicModel.name,
      version: publicModel.version,
    });
    expect(response.body).not.toContainEqual({
      id: notAccessibleModel.id,
      name: notAccessibleModel.name,
      version: notAccessibleModel.version,
    });
  });

  it(`/GET all product data models which belong to the organization or which are public ${userHasNotThePermissionsTxt}`, async () => {
    const otherOrganizationId = randomUUID();
    const response = await request(app.getHttpServer())
      .get(`/product-data-models?organization=${otherOrganizationId}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.close();
  });
});
