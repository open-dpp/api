import { Test, TestingModule } from '@nestjs/testing';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './model.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UsersService } from '../../users/infrastructure/users.service';
import { DataSource } from 'typeorm';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifierEntity } from '../../unique-product-identifier/infrastructure/unique.product.identifier.entity';
import { DataValue, Model } from '../domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import {
  DataSection,
  ProductDataModel,
  TextField,
} from '../../product-data-model/domain/product.data.model';

describe('ModelsService', () => {
  let modelsService: ModelsService;
  let userService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ModelEntity,
          UniqueProductIdentifierEntity,
          UserEntity,
        ]),
      ],
      providers: [ModelsService, UniqueProductIdentifierService, UsersService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    modelsService = module.get<ModelsService>(ModelsService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should create a product', async () => {
    const user = new User(randomUUID());
    const model = new Model(undefined, 'My product', 'This is my product');
    model.assignOwner(user);
    const productDataModel = new ProductDataModel(undefined, 'Laptop', '1.0', [
      new DataSection(randomUUID(), [
        new TextField(randomUUID(), 'Title', { min: 2 }),
        new TextField(randomUUID(), 'Title 2', { min: 7 }),
      ]),
      new DataSection(randomUUID(), [
        new TextField(randomUUID(), 'Title 3', { min: 8 }),
      ]),
    ]);

    model.assignProductDataModel(productDataModel);
    const { id } = await modelsService.save(model);
    const foundProduct = await modelsService.findOne(id);
    expect(foundProduct.name).toEqual(model.name);
    expect(foundProduct.description).toEqual(model.description);
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
