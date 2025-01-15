import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UsersService } from '../../users/infrastructure/users.service';
import { DataSource } from 'typeorm';
import { PermalinksService } from '../../permalinks/infrastructure/permalinks.service';
import { PermalinkEntity } from '../../permalinks/infrastructure/permalink.entity';
import { Product } from '../domain/product';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

describe('ProductsService', () => {
  let productService: ProductsService;
  let userService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([ProductEntity, PermalinkEntity, UserEntity]),
      ],
      providers: [ProductsService, PermalinksService, UsersService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    productService = module.get<ProductsService>(ProductsService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should create a product', async () => {
    const user = new User(randomUUID());
    const product = new Product(undefined, 'My product', 'This is my product');
    product.assignOwner(user);
    const { id } = await productService.save(product);
    const foundProduct = await productService.findOne(id);
    expect(foundProduct.name).toEqual(product.name);
    expect(foundProduct.description).toEqual(product.description);
    expect((await userService.findOne(user.id)).id).toEqual(foundProduct.owner);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
