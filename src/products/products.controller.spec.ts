import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProductsModule } from './products.module';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { ProductEntity } from './entities/product.entity';
import { makeUser, User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../test/keycloak-auth.guard.testing';
import { ProductsService } from './products.service';
import { PermalinksModule } from '../permalinks/permalinks.module';
import { PermalinksService } from '../permalinks/permalinks.service';
import { AuthContext } from '../auth/auth-request';
import { v4 as uuid4 } from 'uuid';

describe('ProductsController', () => {
  let app: INestApplication;
  let service: ProductsService;
  let permalinkService: PermalinksService;
  let productsService: ProductsService;
  const authContext = new AuthContext();
  authContext.user = makeUser(uuid4());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([ProductEntity, User]),
        ProductsModule,
        PermalinksModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: new KeycloakAuthTestingGuard(
            new Map([['token1', authContext.user.id]]),
          ),
        },
      ],
    }).compile();

    service = moduleRef.get<ProductsService>(ProductsService);
    permalinkService = moduleRef.get(PermalinksService);
    productsService = moduleRef.get(ProductsService);

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
    const found = await service.findOne(response.body.id);
    expect(response.body.id).toEqual(found.id);

    const foundPermalink = await permalinkService.findOneByReferencedId(
      found.id,
    );
    expect(foundPermalink.referencedId).toEqual(found.id);
    expect(response.body.permalinks).toEqual([{ uuid: foundPermalink.uuid }]);
  });

  it(`/GET products`, async () => {
    const productNames = ['P1', 'P2'];
    const products = await Promise.all(
      productNames.map(
        async (pn) =>
          await productsService.create(
            {
              name: pn,
              description: 'My desc',
            },
            authContext,
          ),
      ),
    );
    const response = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', 'Bearer token1');
    for (const product of products) {
      expect(response.body.find((p) => p.id === product.id).permalinks).toEqual(
        [
          {
            uuid: (await permalinkService.findOneByReferencedId(product.id))
              .uuid,
          },
        ],
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
