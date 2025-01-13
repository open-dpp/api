import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from './organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuid4 } from 'uuid';
import { DataSource } from 'typeorm';
import { Organization } from '../domain/organization';
import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([OrganizationEntity, UserEntity]),
      ],
      providers: [OrganizationsService],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create an organization', async () => {
    const name = `My Organization ${uuid4()}`;
    const organization = new Organization(randomUUID(), name, []);

    const { id } = await service.save(organization);
    const found = await service.findOne(id);
    expect(found.name).toEqual(name);
  });

  it('should add members to organization', async () => {
    const name = `My Organization ${uuid4()}`;
    const organization = new Organization(randomUUID(), name, []);
    const user = new User(randomUUID());
    const user2 = new User(randomUUID());
    organization.join(user);
    organization.join(user2);
    await service.save(organization);
    const found = await service.findOne(organization.id);
    expect(found.members).toEqual([user, user2]);
  });
  afterEach(async () => {
    await dataSource.destroy();
  });
});
