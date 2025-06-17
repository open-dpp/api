import { Test, TestingModule } from '@nestjs/testing';
import { ProductPassportReferenceService } from './product-passport-reference.service';
import { randomUUID } from 'crypto';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  ProductPassportReferenceDoc,
  ProductPassportReferenceSchema,
} from './product-passport-reference.schema';
import { ProductPassportReference } from '../domain/product-passport-reference';
import { Item } from '../../items/domain/item';

describe('ProductPassportService', () => {
  let service: ProductPassportReferenceService;
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductPassportReferenceDoc.name,
            schema: ProductPassportReferenceSchema,
          },
        ]),
      ],
      providers: [ProductPassportReferenceService],
    }).compile();
    service = module.get<ProductPassportReferenceService>(
      ProductPassportReferenceService,
    );
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  it('returns undefined if requested product passport reference could not be found', async () => {
    const found = await service.findOne(randomUUID(), randomUUID());
    expect(found).toBeUndefined();
  });

  it('should create and find product passport reference', async () => {
    const referenceId = randomUUID();
    const organizationId = randomUUID();
    const item = Item.create({
      organizationId,
      userId: randomUUID(),
    });
    const productPassportReference = ProductPassportReference.create({
      referenceId,
      passport: item,
      organizationId,
    });

    await service.save(productPassportReference);
    const found = await service.findOne(organizationId, referenceId);
    expect(found).toEqual(productPassportReference);
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
