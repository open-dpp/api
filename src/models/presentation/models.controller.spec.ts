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
import { DataValue, Model } from '../domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { ProductDataModelEntity } from '../../product-data-model/infrastructure/product.data.model.entity';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product.data.model.service';
import { ProductDataModelModule } from '../../product-data-model/product.data.model.module';

describe('ModelsController', () => {
  let app: INestApplication;
  let uniqueProductIdentifierService: UniqueProductIdentifierService;
  let modelsService: ModelsService;
  let productDataModelService: ProductDataModelService;
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ModelEntity,
          UserEntity,
          ProductDataModelEntity,
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
          ),
        },
      ],
    }).compile();

    uniqueProductIdentifierService = moduleRef.get(
      UniqueProductIdentifierService,
    );
    modelsService = moduleRef.get(ModelsService);
    productDataModelService = moduleRef.get<ProductDataModelService>(
      ProductDataModelService,
    );

    app = moduleRef.createNestApplication();

    await app.init();
  });

  it(`/CREATE model`, async () => {
    const body = { name: 'My name', description: 'My desc' };
    const response = await request(app.getHttpServer())
      .post('/models')
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    const found = await modelsService.findOne(response.body.id);
    expect(response.body.id).toEqual(found.id);

    const foundUniqueProductIdentifiers =
      await uniqueProductIdentifierService.findAllByReferencedId(found.id);
    expect(foundUniqueProductIdentifiers).toHaveLength(1);
    for (const uniqueProductIdentifier of foundUniqueProductIdentifiers) {
      expect(uniqueProductIdentifier.referenceId).toEqual(found.id);
    }
    const sortFn = (a, b) => a.uuid.localeCompare(b.uuid);
    expect([...response.body.uniqueProductIdentifiers].sort(sortFn)).toEqual(
      [...foundUniqueProductIdentifiers].map((u) => u.toPlain()).sort(sortFn),
    );
  });

  it(`/GET models`, async () => {
    const modelNames = ['P1', 'P2'];
    const models = await Promise.all(
      modelNames.map(async (pn) => {
        const model = Model.fromPlain({ name: pn, description: 'My desc' });
        model.assignOwner(authContext.user);
        return await modelsService.save(model);
      }),
    );
    const response = await request(app.getHttpServer())
      .get('/models')
      .set('Authorization', 'Bearer token1');
    for (const model of models) {
      expect(
        response.body.find((p) => p.id === model.id).uniqueProductIdentifiers,
      ).toEqual(
        await uniqueProductIdentifierService.findAllByReferencedId(model.id),
      );
    }
  });

  it('assigns product data model to model', async () => {
    const body = { name: 'My name', description: 'My desc' };
    const model = Model.fromPlain({ name: 'My name', description: 'My desc' });
    model.assignOwner(authContext.user);
    await modelsService.save(model);

    const productDataModel = ProductDataModel.fromPlain({
      name: 'Laptop',
      version: '1.0',
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
              options: { min: 7 },
            },
          ],
        },
        {
          dataFields: [
            {
              type: 'TextField',
              name: 'Title 3',
              options: { min: 8 },
            },
          ],
        },
      ],
    });
    await productDataModelService.save(productDataModel);

    const response = await request(app.getHttpServer())
      .post(`/models/${model.id}/product-data-models/${productDataModel.id}`)
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    const responseGet = await request(app.getHttpServer())
      .get(`/models/${model.id}`)
      .set('Authorization', 'Bearer token1');
    expect(responseGet.body.dataValues).toEqual([
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: productDataModel.sections[0].id,
        dataFieldId: productDataModel.sections[0].dataFields[0].id,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: productDataModel.sections[0].id,
        dataFieldId: productDataModel.sections[0].dataFields[1].id,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: productDataModel.sections[1].id,
        dataFieldId: productDataModel.sections[1].dataFields[0].id,
      }),
    ]);
    expect(responseGet.body.productDataModelId).toEqual(productDataModel.id);
  });

  afterAll(async () => {
    await app.close();
  });
});
