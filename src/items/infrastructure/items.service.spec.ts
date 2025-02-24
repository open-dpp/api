import { Test, TestingModule } from '@nestjs/testing';
import { ModelsService } from '../../models/infrastructure/models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from '../../models/infrastructure/model.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { DataSource } from 'typeorm';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifierEntity } from '../../unique-product-identifier/infrastructure/unique.product.identifier.entity';
import { Model } from '../../models/domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Item } from '../domain/item';
import { ItemsService } from './items.service';
import { ItemEntity } from './item.entity';
import { UsersService } from '../../users/infrastructure/users.service';

describe('ProductsService', () => {
  let itemService: ItemsService;
  let modelsService: ModelsService;
  let usersService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ModelEntity,
          UniqueProductIdentifierEntity,
          UserEntity,
          ItemEntity,
        ]),
      ],
      providers: [
        ItemsService,
        ModelsService,
        UniqueProductIdentifierService,
        UsersService,
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    itemService = module.get<ItemsService>(ItemsService);
    modelsService = module.get<ModelsService>(ModelsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should create and find item for a model', async () => {
    const user = new User(randomUUID(), 'test@test.test');
    await usersService.save(user);
    const model = Model.fromPlain({
      name: 'name',
      description: 'description',
    });

    model.assignOwner(user);
    const savedModel = await modelsService.save(model);
    const item = new Item();
    item.defineModel(savedModel.id);
    const savedItem = await itemService.save(item);
    expect(savedItem.model).toEqual(savedModel.id);
    const foundItem = await itemService.findById(item.id);
    expect(foundItem.model).toEqual(savedModel.id);
  });

  it('should create multiple items for a model and find them by model', async () => {
    const model = Model.fromPlain({
      name: 'name',
      description: 'description',
    });
    const user = new User(randomUUID(), 'test@test.test');
    await usersService.save(user);
    model.assignOwner(user);
    const model2 = Model.fromPlain({
      name: 'name',
      description: 'description',
    });
    model2.assignOwner(user);
    const savedModel1 = await modelsService.save(model);
    const savedModel2 = await modelsService.save(model2);
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
