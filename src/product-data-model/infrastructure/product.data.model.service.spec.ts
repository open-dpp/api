import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductDataModelService } from './product.data.model.service';
import { ProductDataModelEntity } from './product.data.model.entity';
import { ProductDataModel } from '../domain/product.data.model';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { SectionType } from '../domain/section';

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

  const laptopModelPlain = {
    name: 'Laptop',
    version: 'v2',
    sections: [
      {
        name: 'Environment',
        type: SectionType.GROUP,
        dataFields: [
          {
            name: 'Serial number',
            type: 'TextField',
          },
          {
            name: 'Processor',
            type: 'TextField',
          },
        ],
      },
    ],
  };

  it('fails if requested product data model could not be found', async () => {
    await expect(service.findOne(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(ProductDataModel.name),
    );
  });

  it('should create product data model', async () => {
    const productDataModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
    });

    const { id } = await service.save(productDataModel);
    const found = await service.findOne(id);
    expect(found).toEqual(productDataModel);
  });

  it('should return product data models by name', async () => {
    const productDataModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
      name: `${randomUUID()}-data-model`,
    });

    await service.save(productDataModel);
    const found = await service.findAll({ name: productDataModel.name });
    expect(found).toEqual([
      { id: productDataModel.id, name: productDataModel.name },
    ]);
  });

  it('should return all product data models', async () => {
    const laptopModel = ProductDataModel.fromPlain({ ...laptopModelPlain });
    const phoneModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
      name: 'phone',
    });
    await service.save(laptopModel);
    await service.save(phoneModel);
    const foundAll = await service.findAll();
    expect(foundAll).toContainEqual({
      id: laptopModel.id,
      name: laptopModel.name,
    });
    expect(foundAll).toContainEqual({
      id: phoneModel.id,
      name: phoneModel.name,
    });
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
