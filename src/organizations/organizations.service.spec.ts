import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { Product } from '../products/entities/product.entity';
import { Permalink } from '../permalinks/entities/permalink.entity';
import { makeUser, User } from '../users/entities/user.entity';
import { Organization } from './entities/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid4 } from 'uuid';
import { DataSource } from 'typeorm';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule([User, Organization, Product, Permalink]),
        TypeOrmModule.forFeature([Organization, User]),
      ],
      providers: [OrganizationsService],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create an organization', async () => {
    const name = `My Organization ${uuid4()}`;
    const { id } = await service.create({ name });
    const found = await service.findOne(id);
    expect(found.name).toEqual(name);
  });

  it('should add members to organization', async () => {
    const name = `My Organization ${uuid4()}`;
    const orga: Organization = await service.create({ name });
    const user = makeUser(uuid4());
    const user2 = makeUser(uuid4());
    await service.join(orga, user);
    await service.join(orga, user2);
    await service.join(orga, user);

    const found = await service.findOne(orga.id);
    expect(found.users).toEqual([user, user2]);
  });
  afterEach(async () => {
    await dataSource.destroy();
  });
});
