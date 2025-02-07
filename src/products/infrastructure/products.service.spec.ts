import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UsersService } from '../../users/infrastructure/users.service';
import { DataSource } from 'typeorm';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifierEntity } from '../../unique-product-identifier/infrastructure/unique.product.identifier.entity';
import { DataValue, Product } from '../domain/product';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import {
  DataSection,
  ProductDataModel,
  TextField,
} from '../../product-data-model/domain/product.data.model';

describe('ProductsService', () => {
  let productService: ProductsService;
  let userService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ProductEntity,
          UniqueProductIdentifierEntity,
          UserEntity,
        ]),
      ],
      providers: [
        ProductsService,
        UniqueProductIdentifierService,
        UsersService,
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    productService = module.get<ProductsService>(ProductsService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should create a product with data', async () => {
    const user = new User(randomUUID());
    const product = new Product(undefined, 'My product', 'This is my product');
    product.assignOwner(user);
    const productDataModel = new ProductDataModel(undefined, 'Laptop', '1.0', [
      new DataSection(randomUUID(), [
        new TextField(randomUUID(), 'Title', { min: 2 }),
        new TextField(randomUUID(), 'Title 2', { min: 7 }),
      ]),
      new DataSection(randomUUID(), [
        new TextField(randomUUID(), 'Title 3', { min: 8 }),
      ]),
    ]);
    product.assignProductDataModel(productDataModel);
    const { id } = await productService.save(product);
    const foundProduct = await productService.findOne(id);
    expect(foundProduct.name).toEqual(product.name);
    expect(foundProduct.description).toEqual(product.description);
    expect(foundProduct.productDataModelId).toEqual(productDataModel.id);
    expect(foundProduct.dataValues).toEqual([
      new DataValue(
        expect.any(String),
        undefined,
        productDataModel.sections[0].id,
        productDataModel.sections[0].dataFields[0].id,
      ),
      new DataValue(
        expect.any(String),
        undefined,
        productDataModel.sections[0].id,
        productDataModel.sections[0].dataFields[1].id,
      ),
      new DataValue(
        expect.any(String),
        undefined,
        productDataModel.sections[1].id,
        productDataModel.sections[1].dataFields[0].id,
      ),
    ]);

    expect((await userService.findOne(user.id)).id).toEqual(foundProduct.owner);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
