import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProductsModule } from './products.module';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../test/keycloak-auth.guard.testing';
import { ProductsService } from './products.service';
import { PermalinksModule } from '../permalinks/permalinks.module';
import { PermalinksService } from '../permalinks/permalinks.service';

describe('ProductsController', () => {
  let app: INestApplication;
  let service: ProductsService;
  let permalinkService: PermalinksService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([Product, User]),
        ProductsModule,
        PermalinksModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: new KeycloakAuthTestingGuard(
            new Map([['token1', 'user1']]),
          ),
        },
      ],
    }).compile();

    service = moduleRef.get<ProductsService>(ProductsService);
    permalinkService = moduleRef.get(PermalinksService);

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it(`/CREATE product`, async () => {
    const body = { name: 'My name', description: 'My desc' };
    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.permalinks).toHaveLength(1);
    const found = await service.findOne(response.body.id);
    expect(response.body.id).toEqual(found.id);
    expect(found.permalinks).toHaveLength(1);
    const foundPermalink = await permalinkService.findOne(
      found.permalinks[0].uuid,
    );
    expect(foundPermalink.product.id).toEqual(found.id);
  });

  afterAll(async () => {
    await app.close();
  });
});
