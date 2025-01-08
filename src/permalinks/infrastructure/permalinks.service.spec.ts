import { Test, TestingModule } from '@nestjs/testing';
import { PermalinksService } from './permalinks.service';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { ProductEntity } from '../../products/infrastructure/product.entity';
import { PermalinkEntity } from './permalink.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import { Permalink } from '../domain/permalink';

describe('PermalinksService', () => {
  let service: PermalinksService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([PermalinkEntity, ProductEntity]),
      ],
      providers: [PermalinksService],
    }).compile();
    service = module.get<PermalinksService>(PermalinksService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create permalink', async () => {
    const referencedId = uuid4();
    const permalink = new Permalink();
    permalink.linkTo(referencedId);
    const { uuid } = await service.save(permalink);
    const found = await service.findOne(uuid);
    expect(found.getReference()).toEqual(referencedId);
  });

  it('should find all permalinks with given referenced id', async () => {
    const referencedId = uuid4();
    const permalink1 = new Permalink();
    permalink1.linkTo(referencedId);
    await service.save(permalink1);
    const permalink2 = new Permalink();
    permalink2.linkTo(referencedId);
    await service.save(permalink2);
    const found = await service.findAllByReferencedId(referencedId);
    expect(found).toContainEqual(permalink1);
    expect(found).toContainEqual(permalink2);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
