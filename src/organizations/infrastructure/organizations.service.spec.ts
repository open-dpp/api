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
import { AuthContext } from '../../auth/auth-request';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { UsersService } from '../../users/infrastructure/users.service';

describe('OrganizationsService', () => {
  let organizationsService: OrganizationsService;
  let dataSource: DataSource;
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@test.test');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([OrganizationEntity, UserEntity]),
      ],
      providers: [OrganizationsService, UsersService, KeycloakResourcesService],
    })
      .overrideProvider(KeycloakResourcesService)
      .useValue(
        KeycloakResourcesServiceTesting.fromPlain({
          users: [{ id: authContext.user.id, email: authContext.user.email }],
        }),
      )
      .compile();

    organizationsService =
      module.get<OrganizationsService>(OrganizationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should create an organization', async () => {
    const name = `My Organization ${uuid4()}`;
    const organization = new Organization(randomUUID(), name, [
      authContext.user,
    ]);
    const { id } = await organizationsService.save(authContext, organization);
    const found = await organizationsService.findOne(id);
    expect(found.name).toEqual(name);
  });

  it('should add members to organization', async () => {
    const name = `My Organization ${uuid4()}`;
    const organization = new Organization(randomUUID(), name, []);

    const user2 = new User(randomUUID(), 'test2@test.test');
    organization.join(authContext.user);
    organization.join(user2);
    await organizationsService.save(authContext, organization);
    const found = await organizationsService.findOne(organization.id);
    expect(found.members).toEqual([authContext.user, user2]);
  });
  afterEach(async () => {
    await dataSource.destroy();
  });
});
