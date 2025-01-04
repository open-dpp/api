import { Test, TestingModule } from '@nestjs/testing';
import { PermalinksService } from './permalinks.service';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { Product } from '../products/entities/product.entity';
import { Permalink } from './entities/permalink.entity';
import { makeUser } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service';
import { ProductsModule } from '../products/products.module';
import { AuthContext } from '../auth/auth-request';
import { DataSource } from 'typeorm';

describe('PermalinksService', () => {
  let service: PermalinksService;
  let prodcuctsService: ProductsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([Permalink, Product]),
        ProductsModule,
      ],
      providers: [PermalinksService],
    }).compile();

    prodcuctsService = module.get<ProductsService>(ProductsService);
    service = module.get<PermalinksService>(PermalinksService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create permalink', async () => {
    const authContext = new AuthContext();
    authContext.user = makeUser('someID');
    const name = 'My interesting product';
    const description = 'My description';
    const { id: productId } = await prodcuctsService.create(
      {
        name,
        description,
      },
      authContext,
    );
    const { uuid } = await service.create({ productId, view: 'all' });
    const found = await service.findOne(uuid);
    expect(found.productId).toEqual(productId);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
