import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid4 } from 'uuid';
import { UniqueProductIdentifier } from '../domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  UniqueProductIdentifierDoc,
  UniqueProductIdentifierSchema,
} from './unique-product-identifier.schema';
import { UniqueProductIdentifierService } from './unique-product-identifier.service';

describe('UniqueProductIdentifierService', () => {
  let service: UniqueProductIdentifierService;
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: UniqueProductIdentifierDoc.name,
            schema: UniqueProductIdentifierSchema,
          },
        ]),
      ],
      providers: [UniqueProductIdentifierService],
    }).compile();
    service = module.get<UniqueProductIdentifierService>(
      UniqueProductIdentifierService,
    );
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  it('should create unique product identifier', async () => {
    const referencedId = uuid4();
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(referencedId);
    const { uuid } = await service.save(uniqueProductIdentifier);
    const found = await service.findOne(uuid);
    expect(found.referenceId).toEqual(referencedId);
  });

  it('fails if requested unique product identifier model could not be found', async () => {
    await expect(service.findOne(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(UniqueProductIdentifier.name),
    );
  });

  it('should find all unique product identifiers with given referenced id', async () => {
    const referencedId = uuid4();
    const uniqueProductIdentifier1 = new UniqueProductIdentifier();
    uniqueProductIdentifier1.linkTo(referencedId);
    await service.save(uniqueProductIdentifier1);
    const uniqueProductIdentifier2 = new UniqueProductIdentifier();
    uniqueProductIdentifier2.linkTo(referencedId);
    await service.save(uniqueProductIdentifier2);
    const found = await service.findAllByReferencedId(referencedId);
    expect(found).toContainEqual(uniqueProductIdentifier1);
    expect(found).toContainEqual(uniqueProductIdentifier2);
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
