import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProductsModule } from '../products.module';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { ProductEntity } from '../infrastructure/product.entity';
import { makeUser, User } from '../../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { ProductsService } from '../infrastructure/products.service';
import { PermalinksModule } from '../../permalinks/permalinks.module';
import { PermalinksService } from '../../permalinks/infrastructure/permalinks.service';
import { AuthContext } from '../../auth/auth-request';
import { v4 as uuid4 } from 'uuid';
import { Product } from '../domain/product';

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

    const foundPermalinks = await permalinkService.findAllByReferencedId(
      found.id,
    );
    for (const permalink of foundPermalinks) {
      expect(permalink.getReference()).toEqual(found.id);
    }
    const sortFn = (a, b) => a.uuid.localeCompare(b.uuid);
    expect([...response.body.permalinks].sort(sortFn)).toEqual(
      [...foundPermalinks].sort(sortFn),
    );
  });

  it(`/GET products`, async () => {
    const productNames = ['P1', 'P2'];
    const products = await Promise.all(
      productNames.map(
        async (pn) =>
          await productsService.save(
            new Product(undefined, pn, 'My desc'),
            authContext,
          ),
      ),
    );
    const response = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', 'Bearer token1');
    for (const product of products) {
      expect(response.body.find((p) => p.id === product.id).permalinks).toEqual(
        await permalinkService.findAllByReferencedId(product.id),
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
