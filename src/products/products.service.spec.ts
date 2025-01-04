import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { makeUser, User } from '../users/entities/user.entity';
import { AuthContext } from '../auth/auth-request';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { UsersService } from '../users/users.service';
import { DataSource } from 'typeorm';
import { v4 as uuid4 } from 'uuid';

describe('ProductsService', () => {
  let productService: ProductsService;
  let userService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([Product, User]),
      ],
      providers: [ProductsService, UsersService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    productService = module.get<ProductsService>(ProductsService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should create a product', async () => {
    const authContext = new AuthContext();
    authContext.user = makeUser(uuid4());
    const name = `My interesting product ${uuid4()}`;
    const description = 'My description';
    const { id } = await productService.create(
      {
        name,
        description,
      },
      authContext,
    );
    const found = await productService.findOne(id);
    expect(found.name).toEqual(name);
    expect(found.description).toEqual(description);
    expect(await userService.findOneById(found.createdByUserId)).toBeDefined();
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
