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
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

describe('ProductsService', () => {
  let itemService: ItemsService;
  let modelsService: ModelsService;
  let organizationsService: OrganizationsService;
  let dataSource: DataSource;
  const user = new User(randomUUID(), 'test@test.test');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ModelEntity,
          UniqueProductIdentifierEntity,
          UserEntity,
          ItemEntity,
          OrganizationEntity,
        ]),
      ],
      providers: [
        ItemsService,
        ModelsService,
        UniqueProductIdentifierService,
        OrganizationsService,
        UsersService,
        {
          provide: KeycloakResourcesService,
          useValue: KeycloakResourcesServiceTesting.fromPlain({
            users: [{ id: user.id, email: user.email }],
          }),
        },
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    itemService = module.get<ItemsService>(ItemsService);
    modelsService = module.get<ModelsService>(ModelsService);
    organizationsService =
      module.get<OrganizationsService>(OrganizationsService);
  });

  it('fails if requested item could not be found', async () => {
    await expect(itemService.findById(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(Item.name),
    );
  });

  it('should create and find item for a model', async () => {
    const organization = Organization.create({ name: 'My Orga', user });
    await organizationsService.save(organization);
    const model = Model.create({
      name: 'name',
      user,
      organization,
    });

    const savedModel = await modelsService.save(model);
    const item = new Item();
    item.defineModel(savedModel.id);
    const savedItem = await itemService.save(item);
    expect(savedItem.model).toEqual(savedModel.id);
    const foundItem = await itemService.findById(item.id);
    expect(foundItem.model).toEqual(savedModel.id);
  });

  it('should create multiple items for a model and find them by model', async () => {
    const organization = Organization.create({ name: 'My Orga', user });
    await organizationsService.save(organization);
    const model = Model.create({
      name: 'name',
      user,
      organization,
    });
    const model2 = Model.create({
      name: 'name',
      user,
      organization,
    });
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
