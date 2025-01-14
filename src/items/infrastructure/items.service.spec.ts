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
    const model = await productService.save(
      new Product(undefined, 'name', 'description'),
      new User(randomUUID()),
    );
    const item = new Item();
    item.defineModel(model.id);
    const savedItem = await itemService.save(item);
    expect(savedItem.model).toEqual(model.id);
    const foundItem = await itemService.findById(item.id);
    expect(foundItem.model).toEqual(model.id);
  });

  it('should create multiple items for a model and find them by model', async () => {
    const model = await productService.save(
      new Product(undefined, 'name', 'description'),
      new User(randomUUID()),
    );
    const model2 = await productService.save(
      new Product(undefined, 'name', 'description'),
      new User(randomUUID()),
    );
    const item1 = new Item();
    item1.defineModel(model.id);
    const item2 = new Item();
    item2.defineModel(model.id);
    await itemService.save(item1);
    await itemService.save(item2);
    const item3 = new Item();
    item3.defineModel(model2.id);

    const foundItems = await itemService.findAllByModel(model);
    expect(foundItems).toEqual([item1, item2]);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
