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
import { PermissionsModule } from '../../permissions/permissions.module';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

describe('ItemsService', () => {
  let itemService: ItemsService;
  const user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({ name: 'Firma Y', user });
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ItemDoc.name,
            schema: ItemSchema,
          },
          {
            name: UniqueProductIdentifierDoc.name,
            schema: UniqueProductIdentifierSchema,
          },
        ]),
      ],
      providers: [ItemsService, UniqueProductIdentifierService],
    }).compile();
    itemService = module.get<ItemsService>(ItemsService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  it('fails if requested item could not be found', async () => {
    await expect(itemService.findById(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(Item.name),
    );
  });

  it('should create and find item for a model', async () => {
    const model = Model.create({
      name: 'name',
      user,
      organization,
    });

    const item = new Item();
    item.defineModel(model.id);
    const savedItem = await itemService.save(item);
    expect(savedItem.model).toEqual(model.id);
    const foundItem = await itemService.findById(item.id);
    expect(foundItem.model).toEqual(model.id);
  });

  it('should create multiple items for a model and find them by model', async () => {
    const model1 = Model.create({
      name: 'name',
      user,
      organization,
    });
    const model2 = Model.create({
      name: 'name',
      user,
      organization,
    });
    const item1 = new Item();
    item1.defineModel(model1.id);
    const item2 = new Item();
    item2.defineModel(model1.id);
    await itemService.save(item1);
    await itemService.save(item2);
    const item3 = new Item();
    item3.defineModel(model2.id);

    const foundItems = await itemService.findAllByModel(model1.id);
    expect(foundItems).toEqual([item1, item2]);
  });

  it('should save item with unique product identifiers', async () => {
    const model = Model.create({
      name: 'Model with UPIs',
      user,
      organization,
    });
    // Create item with unique product identifiers
    const item = new Item();
    item.defineModel(model.id);

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
    } as ItemDoc;

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

  afterAll(async () => {
    await mongoConnection.close();
  });
});
