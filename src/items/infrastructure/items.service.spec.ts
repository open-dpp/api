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
import { PermissionsModule } from '../../permissions/permissions.module';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { DppEventsModule } from '../../dpp-events/dpp-events.module';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { userObj1 } from '../../../test/users-and-orgs';

describe('ProductsService', () => {
  let itemService: ItemsService;
  let modelsService: ModelsService;
  let organizationsService: OrganizationsService;
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
          OrganizationEntity,
        ]),
        MongooseTestingModule,
        PermissionsModule,
        DppEventsModule,
      ],
      providers: [
        ItemsService,
        ModelsService,
        UniqueProductIdentifierService,
        OrganizationsService,
        UsersService,
        KeycloakResourcesService,
      ],
    })
      .overrideProvider(KeycloakResourcesService)
      .useClass(KeycloakResourcesServiceTesting)
      .compile();

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
    const organization = Organization.create({
      name: 'My Orga',
      user: userObj1,
    });
    await organizationsService.save(organization);
    const model = Model.create({
      name: 'name',
      user: userObj1,
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
    const organization = Organization.create({
      name: 'My Orga',
      user: userObj1,
    });
    await organizationsService.save(organization);
    const model = Model.create({
      name: 'name',
      user: userObj1,
      organization,
    });
    const model2 = Model.create({
      name: 'name',
      user: userObj1,
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

  it('should throw an error when saving item with non-existent model', async () => {
    const item = new Item();
    const nonExistentModelId = randomUUID();
    item.defineModel(nonExistentModelId);

    await expect(itemService.save(item)).rejects.toThrow(
      new NotFoundInDatabaseException(Model.name),
    );
  });

  it('should save item with unique product identifiers', async () => {
    // Create organization and model
    const organization = Organization.create({
      name: 'Org with UPIs',
      user: userObj1,
    });
    await organizationsService.save(organization);
    const model = Model.create({
      name: 'Model with UPIs',
      user: userObj1,
      organization,
    });
    const savedModel = await modelsService.save(model);

    // Create item with unique product identifiers
    const item = new Item();
    item.defineModel(savedModel.id);

    // Add unique product identifiers to the item
    const upi1 = item.createUniqueProductIdentifier();
    const upi2 = item.createUniqueProductIdentifier();

    // Save the item
    const savedItem = await itemService.save(item);

    // Verify the saved item has the unique product identifiers
    expect(savedItem.uniqueProductIdentifiers).toHaveLength(2);
    expect(savedItem.uniqueProductIdentifiers[0].uuid).toBe(upi1.uuid);
    expect(savedItem.uniqueProductIdentifiers[1].uuid).toBe(upi2.uuid);

    // Verify the identifiers are linked to the item
    expect(savedItem.uniqueProductIdentifiers[0].referenceId).toBe(item.id);
    expect(savedItem.uniqueProductIdentifiers[1].referenceId).toBe(item.id);

    // Retrieve the item and verify UPIs are still there
    const foundItem = await itemService.findById(item.id);
    expect(foundItem.uniqueProductIdentifiers).toHaveLength(2);
  });

  it('should correctly convert item entity to domain object', () => {
    // Create a mock ItemEntity
    const itemId = randomUUID();
    const modelId = randomUUID();
    const itemEntity = {
      id: itemId,
      modelId: modelId,
    } as ItemEntity;

    // Create mock UPIs
    const upi1 = new UniqueProductIdentifier();
    upi1.linkTo(itemId);
    const upi2 = new UniqueProductIdentifier();
    upi2.linkTo(itemId);
    const upis = [upi1, upi2];

    // Convert to domain object
    const item = itemService.convertToDomain(itemEntity, upis);

    // Verify conversion
    expect(item).toBeInstanceOf(Item);
    expect(item.id).toBe(itemId);
    expect(item.model).toBe(modelId);
    expect(item.uniqueProductIdentifiers).toEqual(upis);
    expect(item.uniqueProductIdentifiers).toHaveLength(2);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
