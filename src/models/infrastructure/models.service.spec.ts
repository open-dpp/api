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
import { Model } from '../domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

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
    const product = new Model(undefined, 'My product', 'This is my product');
    product.assignOwner(user);
    const { id } = await modelsService.save(product);
    const foundProduct = await modelsService.findOne(id);
    expect(foundProduct.name).toEqual(product.name);
    expect(foundProduct.description).toEqual(product.description);
    expect((await userService.findOne(user.id)).id).toEqual(foundProduct.owner);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
