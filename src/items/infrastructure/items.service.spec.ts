import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../products/infrastructure/products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../products/infrastructure/product.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { DataSource } from 'typeorm';
import { PermalinksService } from '../../permalinks/infrastructure/permalinks.service';
import { PermalinkEntity } from '../../permalinks/infrastructure/permalink.entity';
import { Product } from '../../products/domain/product';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Item } from '../domain/item';
import { ItemsService } from './items.service';
import { ItemEntity } from './item.entity';

describe('ProductsService', () => {
  let itemService: ItemsService;
  let productService: ProductsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ProductEntity,
          PermalinkEntity,
          UserEntity,
          ItemEntity,
        ]),
      ],
      providers: [ItemsService, ProductsService, PermalinksService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    itemService = module.get<ItemsService>(ItemsService);
    productService = module.get<ProductsService>(ProductsService);
  });

  it('should create and find item for a model', async () => {
    const model = new Product(undefined, 'name', 'description');
    model.assignOwner(new User(randomUUID()));
    const savedModel = await productService.save(model);
    const item = new Item();
    item.defineModel(savedModel.id);
    const savedItem = await itemService.save(item);
    expect(savedItem.model).toEqual(savedModel.id);
    const foundItem = await itemService.findById(item.id);
    expect(foundItem.model).toEqual(savedModel.id);
  });

  it('should create multiple items for a model and find them by model', async () => {
    const model = new Product(undefined, 'name', 'description');
    const user = new User(randomUUID());
    model.assignOwner(user);
    const model2 = new Product(undefined, 'name', 'description');
    model2.assignOwner(user);
    const savedModel1 = await productService.save(model);
    const savedModel2 = await productService.save(model2);
    const item1 = new Item();
    item1.defineModel(savedModel1.id);
    const item2 = new Item();
    item2.defineModel(savedModel1.id);
    await itemService.save(item1);
    await itemService.save(item2);
    const item3 = new Item();
    item3.defineModel(savedModel2.id);

    const foundItems = await itemService.findAllByModel(savedModel1.id);
    expect(foundItems).toEqual([item1, item2]);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
