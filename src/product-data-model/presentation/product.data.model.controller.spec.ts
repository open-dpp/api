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
import { ProductDataModelService } from '../infrastructure/product.data.model.service';
import { ProductDataModelEntity } from '../infrastructure/product.data.model.entity';
import { ProductDataModelModule } from '../product.data.model.module';
import { ProductDataModel } from '../domain/product.data.model';
import { SectionType } from '../domain/section';

describe('ProductsDataModelController', () => {
  let app: INestApplication;
  let service: ProductDataModelService;
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@test.test');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([ProductDataModelEntity]),
        ProductDataModelModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: new KeycloakAuthTestingGuard(
            new Map([['token1', authContext.user]]),
          ),
        },
      ],
    }).compile();

    service = moduleRef.get<ProductDataModelService>(ProductDataModelService);
    app = moduleRef.createNestApplication();

    await app.init();
  });

  const laptopPlain = {
    version: '1.0',
    name: 'Laptop',
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

  it(`/CREATE product data model`, async () => {
    const body = { ...laptopPlain };
    const response = await request(app.getHttpServer())
      .post('/product-data-models')
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    const found = await service.findOne(response.body.id);
    expect(response.body).toEqual(found);
  });

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

  it(`/GET all product data models`, async () => {
    const laptopModel = ProductDataModel.fromPlain({ ...laptopPlain });
    const phoneModel = ProductDataModel.fromPlain({
      ...laptopPlain,
      name: 'phone',
    });
    await service.save(laptopModel);
    await service.save(phoneModel);
    const response = await request(app.getHttpServer())
      .get(`/product-data-models`)
      .set('Authorization', 'Bearer token1')
      .send();
    expect(response.status).toEqual(200);

    expect(response.body).toContainEqual({
      id: laptopModel.id,
      name: laptopModel.name,
    });
    expect(response.body).toContainEqual({
      id: phoneModel.id,
      name: phoneModel.name,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
