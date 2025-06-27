import { Test, TestingModule } from '@nestjs/testing';
import { Model } from '../../models/domain/model';
import { randomUUID } from 'crypto';
import { Item } from '../domain/item';
import { ItemsService } from './items.service';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { TraceabilityEventsModule } from '../../traceability-events/traceability-events.module';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { userObj1 } from '../../../test/users-and-orgs';
import { AuthContext } from '../../auth/auth-request';
import { Connection } from 'mongoose';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { ItemDoc, ItemSchema } from './item.schema';
import {
  UniqueProductIdentifierDoc,
  UniqueProductIdentifierSchema,
} from '../../unique-product-identifier/infrastructure/unique-product-identifier.schema';
import { PermissionsModule } from '../../permissions/permissions.module';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { UsersService } from '../../users/infrastructure/users.service';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../../product-data-model/domain/product.data.model';
import { ignoreIds } from '../../../test/utils';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';
import { Layout } from '../../data-modelling/domain/layout';
import {
  GroupSection,
  RepeaterSection,
} from '../../product-data-model/domain/section';
import { TextField } from '../../product-data-model/domain/data-field';

describe('ItemsService', () => {
  let itemService: ItemsService;
  const userId = randomUUID();
  const organizationId = randomUUID();
  let mongoConnection: Connection;
  const authContext = new AuthContext();
  authContext.user = userObj1;

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
        PermissionsModule,
        TraceabilityEventsModule,
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([OrganizationEntity, UserEntity]),
      ],
      providers: [
        ItemsService,
        UniqueProductIdentifierService,
        OrganizationsService,
        KeycloakResourcesService,
        UsersService,
      ],
    }).compile();
    itemService = module.get<ItemsService>(ItemsService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  it('fails if requested item could not be found', async () => {
    await expect(itemService.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(Item.name),
    );
  });

  it('should create and find item for a model', async () => {
    const model = Model.create({
      name: 'name',
      userId: userId,
      organizationId,
    });

    const item = Item.create({
      userId: userId,
      organizationId: organizationId,
    });
    item.defineModel(model);
    const savedItem = await itemService.save(item);
    expect(savedItem.modelId).toEqual(model.id);
    const foundItem = await itemService.findOneOrFail(item.id);
    expect(foundItem.modelId).toEqual(model.id);
  });

  it('should create an item with product data model', async () => {
    const item = Item.create({
      userId: userId,
      organizationId: organizationId,
    });
    const productDataModel = ProductDataModel.loadFromDb({
      id: randomUUID(),
      name: 'Laptop',
      version: '1.0',
      visibility: VisibilityLevel.PRIVATE,
      ownedByOrganizationId: organizationId,
      createdByUserId: userId,
      sections: [
        GroupSection.loadFromDb({
          id: randomUUID(),
          parentId: undefined,
          subSections: [],
          name: 'Section 1',
          layout: Layout.create({
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          }),
          dataFields: [
            TextField.create({
              name: 'Title',
              options: { min: 2 },
              layout: Layout.create({
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.ITEM,
            }),
            TextField.create({
              name: 'Title 2',
              options: { min: 7 },
              layout: Layout.create({
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.ITEM,
            }),
          ],
        }),
        GroupSection.loadFromDb({
          id: randomUUID(),
          name: 'Section 2',
          parentId: undefined,
          subSections: [],
          layout: Layout.create({
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          }),
          dataFields: [
            TextField.create({
              name: 'Title 3',
              options: { min: 8 },
              layout: Layout.create({
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.ITEM,
            }),
          ],
        }),
        RepeaterSection.loadFromDb({
          id: randomUUID(),
          parentId: undefined,
          subSections: [],
          name: 'Section 3',
          layout: Layout.create({
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          }),
          dataFields: [
            TextField.create({
              name: 'Title 4',
              options: { min: 8 },
              layout: Layout.create({
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.ITEM,
            }),
          ],
        }),
      ],
    });

    item.assignProductDataModel(productDataModel);
    item.addDataValues([
      DataValue.create({
        value: undefined,
        dataSectionId: productDataModel.sections[2].id,
        dataFieldId: productDataModel.sections[2].dataFields[0].id,
        row: 0,
      }),
    ]);
    const { id } = await itemService.save(item);
    const foundItem = await itemService.findOneOrFail(id);
    expect(foundItem.productDataModelId).toEqual(productDataModel.id);
    expect(foundItem.dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          value: undefined,
          dataSectionId: productDataModel.sections[0].id,
          dataFieldId: productDataModel.sections[0].dataFields[0].id,
          row: 0,
        }),
        DataValue.create({
          value: undefined,
          dataSectionId: productDataModel.sections[0].id,
          dataFieldId: productDataModel.sections[0].dataFields[1].id,
          row: 0,
        }),
        DataValue.create({
          value: undefined,
          dataSectionId: productDataModel.sections[1].id,
          dataFieldId: productDataModel.sections[1].dataFields[0].id,
          row: 0,
        }),
        DataValue.create({
          value: undefined,
          dataSectionId: productDataModel.sections[2].id,
          dataFieldId: productDataModel.sections[2].dataFields[0].id,
          row: 0,
        }),
      ]),
    );
  });

  it('should create multiple items for a model and find them by model', async () => {
    const model1 = Model.create({
      name: 'name',
      userId: userId,
      organizationId: organizationId,
    });
    const model2 = Model.create({
      name: 'name',
      userId: userId,
      organizationId: organizationId,
    });
    const item1 = Item.create({
      userId: userId,
      organizationId: organizationId,
    });
    item1.defineModel(model1);
    const item2 = Item.create({
      userId: userId,
      organizationId: organizationId,
    });
    item2.defineModel(model1);
    await itemService.save(item1);
    await itemService.save(item2);
    const item3 = Item.create({
      userId: userId,
      organizationId: organizationId,
    });
    item3.defineModel(model2);

    const foundItems = await itemService.findAllByModel(model1.id);
    expect(foundItems).toEqual([item1, item2]);
  });

  it('should save item with unique product identifiers', async () => {
    const model = Model.create({
      name: 'Model with UPIs',
      userId: userId,
      organizationId: organizationId,
    });
    // Create item with unique product identifiers
    const item = Item.create({
      userId: userId,
      organizationId: organizationId,
    });
    item.defineModel(model);

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
    const foundItem = await itemService.findOneOrFail(item.id);
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
    const upi1 = UniqueProductIdentifier.create({ referenceId: itemId });
    const upi2 = UniqueProductIdentifier.create({ referenceId: itemId });
    const upis = [upi1, upi2];

    // Convert to domain object
    const item = itemService.convertToDomain(itemEntity, upis);

    // Verify conversion
    expect(item).toBeInstanceOf(Item);
    expect(item.id).toBe(itemId);
    expect(item.modelId).toBe(modelId);
    expect(item.uniqueProductIdentifiers).toEqual(upis);
    expect(item.uniqueProductIdentifiers).toHaveLength(2);
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
