import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ModelsModule } from '../models.module';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { ModelEntity } from '../infrastructure/model.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { ModelsService } from '../infrastructure/models.service';
import { UniqueProductIdentifierModule } from '../../unique-product-identifier/unique.product.identifier.module';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { AuthContext } from '../../auth/auth-request';
import { Model } from '../domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

describe('ModelsController', () => {
  let app: INestApplication;
  let service: ModelsService;
  let uniqueProductIdentifierService: UniqueProductIdentifierService;
  let productsService: ModelsService;
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([ModelEntity, UserEntity]),
        ModelsModule,
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

    service = moduleRef.get<ModelsService>(ModelsService);
    uniqueProductIdentifierService = moduleRef.get(
      UniqueProductIdentifierService,
    );
    productsService = moduleRef.get(ModelsService);

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

    const foundUniqueProductIdentifiers =
      await uniqueProductIdentifierService.findAllByReferencedId(found.id);
    expect(foundUniqueProductIdentifiers).toHaveLength(1);
    for (const uniqueProductIdentifier of foundUniqueProductIdentifiers) {
      expect(uniqueProductIdentifier.getReference()).toEqual(found.id);
    }
    const sortFn = (a, b) => a.uuid.localeCompare(b.uuid);
    expect([...response.body.uniqueProductIdentifiers].sort(sortFn)).toEqual(
      [...foundUniqueProductIdentifiers].sort(sortFn),
    );
  });

  it(`/GET products`, async () => {
    const productNames = ['P1', 'P2'];
    const products = await Promise.all(
      productNames.map(async (pn) => {
        const product = new Model(undefined, pn, 'My desc');
        product.assignOwner(authContext.user);
        return await productsService.save(product);
      }),
    );
    const response = await request(app.getHttpServer())
      .get('/products')
      .set('Authorization', 'Bearer token1');
    for (const product of products) {
      expect(
        response.body.find((p) => p.id === product.id).uniqueProductIdentifiers,
      ).toEqual(
        await uniqueProductIdentifierService.findAllByReferencedId(product.id),
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
