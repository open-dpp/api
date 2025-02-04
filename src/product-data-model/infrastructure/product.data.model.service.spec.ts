import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductDataModelService } from './product.data.model.service';
import { ProductDataModelEntity } from './product.data.model.entity';
import {
  DataSection,
  ProductDataModel,
  TextField,
} from '../domain/product.data.model';

describe('ProductDataModelService', () => {
  let service: ProductDataModelService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([ProductDataModelEntity]),
      ],
      providers: [ProductDataModelService],
    }).compile();
    service = module.get<ProductDataModelService>(ProductDataModelService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create product data model', async () => {
    const productDataModel = new ProductDataModel(undefined, 'v1', [
      new DataSection(undefined, [
        new TextField(undefined, 'Serial number', '48399020'),
        new TextField(undefined, 'Processor', '48399020'),
      ]),
    ]);
    const { id } = await service.save(productDataModel);
    const found = await service.findOne(id);
    expect(found).toEqual(productDataModel);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
