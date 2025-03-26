import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModelService } from '../infrastructure/product-data-model.service';
import { ProductDataModelEntity } from '../infrastructure/product.data.model.entity';
import { ProductDataModelModule } from '../product.data.model.module';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../domain/product.data.model';
import { SectionType } from '../domain/section';
import { OrganizationsModule } from '../../organizations/organizations.module';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { Organization } from '../../organizations/domain/organization';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../infrastructure/product-data-model.schema';
import { Connection } from 'mongoose';

describe('ProductsDataModelController', () => {
  let app: INestApplication;
  let service: ProductDataModelService;
  let organizationsService: OrganizationsService;
  let mongoConnection: Connection;

  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@test.test');
  const organization = Organization.create({
    name: 'Company',
    user: authContext.user,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ProductDataModelEntity,
          UserEntity,
          OrganizationEntity,
        ]),
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDoc.name,
            schema: ProductDataModelSchema,
          },
        ]),
        ProductDataModelModule,
        OrganizationsModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: new KeycloakAuthTestingGuard(
            new Map([['token1', authContext.user]]),
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

    service = moduleRef.get<ProductDataModelService>(ProductDataModelService);
    organizationsService =
      moduleRef.get<OrganizationsService>(OrganizationsService);
    mongoConnection = moduleRef.get<Connection>(getConnectionToken());
    await organizationsService.save(organization);
    app = moduleRef.createNestApplication();

    await app.init();
  });

  const laptopPlain = {
    version: '1.0',
    name: 'Laptop',
    visibility: VisibilityLevel.PRIVATE,
    ownedByOrganizationId: organization.id,
    createdByUserId: authContext.user.id,
    sections: [
      {
        name: 'Section 1',
        type: SectionType.GROUP,
        dataFields: [
          {
            type: 'TextField',
            name: 'Title',
            options: { min: 2 },
          },
          {
            type: 'TextField',
            name: 'Title 2',
            options: { min: 2 },
          },
        ],
      },
    ],
  };

  async function createOrganization(user: User = authContext.user) {
    const organization = Organization.create({
      name: 'My orga',
      user: user,
    });
    return organizationsService.save(organization);
  }
  const userHasNotThePermissionsTxt = `fails if user has not the permissions`;

  it(`/GET product data model`, async () => {
    const productDataModel = ProductDataModel.fromPlain({ ...laptopPlain });
    await service.save(productDataModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models/${productDataModel.id}`)
      .set('Authorization', 'Bearer token1')
      .send();
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(productDataModel.toPlain());
  });

  it(`/GET product data model ${userHasNotThePermissionsTxt}`, async () => {
    const otherUser = new User(randomUUID(), 'test@example.com');
    const otherOrganization = await createOrganization(otherUser);
    const productDataModel = ProductDataModel.create({
      name: 'laptop',
      organization: otherOrganization,
      user: otherUser,
    });
    await service.save(productDataModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models/${productDataModel.id}`)
      .set('Authorization', 'Bearer token1')
      .send();
    expect(response.status).toEqual(403);
  });

  it(`/GET product data model if it is public`, async () => {
    const otherUser = new User(randomUUID(), 'test@example.com');
    const otherOrganization = await createOrganization(otherUser);
    const productDataModel = ProductDataModel.create({
      name: 'laptop',
      organization: otherOrganization,
      user: otherUser,
      visibility: VisibilityLevel.PUBLIC,
    });
    await service.save(productDataModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models/${productDataModel.id}`)
      .set('Authorization', 'Bearer token1')
      .send();
    expect(response.status).toEqual(200);
  });

  it(`/GET all product data models which belong to the organization or which are public`, async () => {
    const laptopModel = ProductDataModel.fromPlain({ ...laptopPlain });
    const phoneModel = ProductDataModel.fromPlain({
      ...laptopPlain,
      name: 'phone',
    });
    const otherUser = new User(randomUUID(), 'test@example.com');
    const otherOrganization = await createOrganization(otherUser);
    const publicModel = ProductDataModel.create({
      name: 'publicModel',
      user: otherUser,
      organization: otherOrganization,
      visibility: VisibilityLevel.PUBLIC,
    });
    const notAccessibleModel = ProductDataModel.create({
      name: 'privateModel',
      user: otherUser,
      organization: otherOrganization,
      visibility: VisibilityLevel.PRIVATE,
    });

    await service.save(laptopModel);
    await service.save(phoneModel);
    await service.save(publicModel);
    await service.save(notAccessibleModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models?organization=${organization.id}`)
      .set('Authorization', 'Bearer token1');
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
    const otherUser = new User(randomUUID(), 'test@example.com');
    const otherOrganization = await createOrganization(otherUser);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models?organization=${otherOrganization.id}`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.close();
  });
});
