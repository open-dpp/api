import { Test, TestingModule } from '@nestjs/testing';
import { UniqueProductIdentifierService } from './unique.product.identifier.service';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { ModelEntity } from '../../models/infrastructure/model.entity';
import { UniqueProductIdentifierEntity } from './unique.product.identifier.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import { UniqueProductIdentifier } from '../domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { TraceabilityEventsModule } from '../../traceability-events/traceability-events.module';

describe('UniqueProductIdentifierService', () => {
  let service: UniqueProductIdentifierService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        MongooseTestingModule,
        TypeOrmModule.forFeature([UniqueProductIdentifierEntity, ModelEntity]),
        TraceabilityEventsModule,
      ],
      providers: [UniqueProductIdentifierService],
    }).compile();
    service = module.get<UniqueProductIdentifierService>(
      UniqueProductIdentifierService,
    );
    dataSource = module.get<DataSource>(DataSource);
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

  afterEach(async () => {
    await dataSource.destroy();
  });
});
