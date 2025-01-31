import { INestApplication } from '@nestjs/common';
import { ProductsService } from '../../products/infrastructure/products.service';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Test } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../products/infrastructure/product.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { UniqueProductIdentifierModule } from '../../unique-product-identifier/unique.product.identifier.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import * as request from 'supertest';
import { Product } from '../../products/domain/product';
import { ItemsService } from '../infrastructure/items.service';
import { ItemsModule } from '../items.module';
import { Item } from '../domain/item';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';

describe('ItemsController', () => {
  let app: INestApplication;
  let itemsService: ItemsService;
  let productsService: ProductsService;
  let uniqueProductIdentifierService: UniqueProductIdentifierService;

  const authContext = new AuthContext();
  authContext.user = new User(randomUUID());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([ProductEntity, UserEntity]),
        ItemsModule,
        UniqueProductIdentifierModule,
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

    productsService = moduleRef.get(ProductsService);
    itemsService = moduleRef.get(ItemsService);
    uniqueProductIdentifierService = moduleRef.get(
      UniqueProductIdentifierService,
    );

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it(`/CREATE item`, async () => {
    const product = new Product(undefined, 'name', 'description');
    product.assignOwner(authContext.user);
    await productsService.save(product);
    const response = await request(app.getHttpServer())
      .post(`/models/${product.id}/items`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(201);
    const found = await itemsService.findById(response.body.id);
    const foundUniqueProductIdentifiers =
      await uniqueProductIdentifierService.findAllByReferencedId(found.id);
    expect(foundUniqueProductIdentifiers).toHaveLength(1);
    expect(response.body).toEqual({
      id: found.id,
      uniqueProductIdentifiers: [
        {
          uuid: foundUniqueProductIdentifiers[0].uuid,
          view: foundUniqueProductIdentifiers[0].view,
          referenceId: found.id,
        },
      ],
    });
  });

  it(`/CREATE item fails cause of missing permissions`, async () => {
    const product = new Product(undefined, 'name', 'description');
    product.assignOwner(new User(randomUUID()));
    await productsService.save(product);
    const response = await request(app.getHttpServer())
      .post(`/models/${product.id}/items`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/GET item`, async () => {
    const product = new Product(undefined, 'name', 'description');
    product.assignOwner(authContext.user);
    await productsService.save(product);
    const item = new Item();
    item.defineModel(product.id);
    const uniqueProductId = item.createUniqueProductIdentifier();
    await itemsService.save(item);
    const response = await request(app.getHttpServer())
      .get(`/models/${product.id}/items/${item.id}`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      id: item.id,
      uniqueProductIdentifiers: [
        {
          referenceId: item.id,
          uuid: uniqueProductId.uuid,
          view: uniqueProductId.view,
        },
      ],
    });
  });

  it(`/GET item fails caused by missing permissions`, async () => {
    const product = new Product(undefined, 'name', 'description');
    product.assignOwner(new User(randomUUID()));
    await productsService.save(product);
    const item = new Item();
    item.defineModel(product.id);
    await itemsService.save(item);
    const response = await request(app.getHttpServer())
      .get(`/models/${product.id}/items/${item.id}`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/GET all item`, async () => {
    const product = new Product(undefined, 'name', 'description');
    product.assignOwner(authContext.user);
    await productsService.save(product);
    const item = new Item();
    item.defineModel(product.id);
    const uniqueProductId1 = item.createUniqueProductIdentifier();
    await itemsService.save(item);
    const item2 = new Item();
    const uniqueProductId2 = item2.createUniqueProductIdentifier();
    item2.defineModel(product.id);
    await itemsService.save(item2);
    const response = await request(app.getHttpServer())
      .get(`/models/${product.id}/items`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      {
        id: item.id,
        uniqueProductIdentifiers: [
          {
            referenceId: item.id,
            uuid: uniqueProductId1.uuid,
            view: uniqueProductId1.view,
          },
        ],
      },
      {
        id: item2.id,
        uniqueProductIdentifiers: [
          {
            referenceId: item2.id,
            uuid: uniqueProductId2.uuid,
            view: uniqueProductId2.view,
          },
        ],
      },
    ]);
  });

  it(`/GET all item fails caused by missing permissions`, async () => {
    const product = new Product(undefined, 'name', 'description');
    product.assignOwner(new User(randomUUID()));
    await productsService.save(product);
    const item = new Item();
    item.defineModel(product.id);
    await itemsService.save(item);
    const item2 = new Item();
    item2.defineModel(product.id);
    await itemsService.save(item2);
    const response = await request(app.getHttpServer())
      .get(`/models/${product.id}/items`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
