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

describe('ProductsDataModelController', () => {
  let app: INestApplication;
  let service: ProductDataModelService;
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID());

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

  it(`/CREATE product data model`, async () => {
    const body = {
      version: '1.0',
      name: 'Laptop',
      sections: [
        {
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
    const response = await request(app.getHttpServer())
      .post('/product-data-models')
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    const found = await service.findOne(response.body.id);
    expect(response.body).toEqual(found);
  });

  afterAll(async () => {
    await app.close();
  });
});
