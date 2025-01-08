import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { makeUser, User } from '../../users/entities/user.entity';
import { AuthContext } from '../../auth/auth-request';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UsersService } from '../../users/users.service';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';
import { PermalinksService } from '../../permalinks/infrastructure/permalinks.service';
import { PermalinkEntity } from '../../permalinks/infrastructure/permalink.entity';
import { Product } from '../domain/product';

describe('ProductsService', () => {
  let productService: ProductsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([ProductEntity, PermalinkEntity, User]),
      ],
      providers: [ProductsService, PermalinksService, UsersService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    productService = module.get<ProductsService>(ProductsService);
  });

  it('should create a product', async () => {
    const authContext = new AuthContext();
    authContext.user = makeUser(uuid4());
    const product = new Product(undefined, 'My product', 'This is my product');
    const { id } = await productService.save(product, authContext);
    const foundProduct = await productService.findOne(id);
    expect(foundProduct.name).toEqual(product.name);
    expect(foundProduct.description).toEqual(product.description);
    // expect(await userService.findOneById(foundProduct.createdByUserId)).toBeDefined();
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
