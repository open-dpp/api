import { Test, TestingModule } from '@nestjs/testing';
import { PermalinksService } from './permalinks.service';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { ProductEntity } from '../products/entities/product.entity';
import { Permalink } from './entities/permalink.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';

describe('PermalinksService', () => {
  let service: PermalinksService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([Permalink, ProductEntity]),
      ],
      providers: [PermalinksService],
    }).compile();
    service = module.get<PermalinksService>(PermalinksService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create permalink', async () => {
    const referencedId = uuid4();
    const { uuid } = await service.create({ referencedId, view: 'all' });
    const found = await service.findOne(uuid);
    expect(found.referencedId).toEqual(referencedId);
  });

  it('should find permalink by referenced id', async () => {
    const referencedId = uuid4();
    const { id } = await service.create({ referencedId, view: 'all' });
    const found = await service.findOneByReferencedId(referencedId);
    expect(found.referencedId).toEqual(referencedId);
    expect(found.id).toEqual(id);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
