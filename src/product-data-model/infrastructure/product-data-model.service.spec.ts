import { Test, TestingModule } from '@nestjs/testing';
import { ProductDataModelService } from './product-data-model.service';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../domain/product.data.model';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from './product-data-model.schema';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { GroupSection, RepeaterSection } from '../domain/section';
import { Layout } from '../../data-modelling/domain/layout';
import { KeycloakResourcesModule } from '../../keycloak-resources/keycloak-resources.module';
import { productDataModelDbPropsFactory } from '../fixtures/product-data-model.factory';

describe('ProductDataModelService', () => {
  let service: ProductDataModelService;
  const userId = randomUUID();
  const organizationId = randomUUID();
  let mongoConnection: Connection;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDoc.name,
            schema: ProductDataModelSchema,
          },
        ]),
        KeycloakResourcesModule,
      ],
      providers: [ProductDataModelService],
    }).compile();
    service = module.get<ProductDataModelService>(ProductDataModelService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  const laptopModelPlain = productDataModelDbPropsFactory.build({
    ownedByOrganizationId: organizationId,
    createdByUserId: userId,
  });

  it('fails if requested product data model could not be found', async () => {
    await expect(service.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(ProductDataModel.name),
    );
  });

  it('should create product data model', async () => {
    const productDataModel = ProductDataModel.loadFromDb({
      ...laptopModelPlain,
    });

    const { id } = await service.save(productDataModel);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(productDataModel);
  });

  it('finds product data model by marketplaceResourceId', async () => {
    const laptop = ProductDataModel.loadFromDb(laptopModelPlain);
    const marketplaceResourceId = randomUUID();
    laptop.assignMarketplaceResource(marketplaceResourceId);
    await service.save(laptop);

    const otherOrganizationId = randomUUID();
    const laptopOtherOrganization = ProductDataModel.loadFromDb(
      productDataModelDbPropsFactory.build({
        ownedByOrganizationId: otherOrganizationId,
        createdByUserId: randomUUID(),
      }),
    );
    laptopOtherOrganization.assignMarketplaceResource(marketplaceResourceId);
    await service.save(laptopOtherOrganization);

    let found = await service.findByMarketplaceResource(
      organizationId,
      marketplaceResourceId,
    );
    expect(found).toEqual(laptop);

    found = await service.findByMarketplaceResource(
      otherOrganizationId,
      marketplaceResourceId,
    );
    expect(found).toEqual(laptopOtherOrganization);
  });

  it('sets correct default granularity level', async () => {
    const laptopModel = {
      id: randomUUID(),
      visibility: VisibilityLevel.PRIVATE,
      name: 'Laptop',
      version: 'v2',
      sections: [
        GroupSection.loadFromDb({
          id: 's1',
          name: 'Environment',
          layout: Layout.create({
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 7 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          }),
          dataFields: [],
          parentId: undefined,
          subSections: [],
          granularityLevel: undefined,
        }),
        RepeaterSection.loadFromDb({
          id: 's2',
          name: 'Materials',
          layout: Layout.create({
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 7 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          }),
          dataFields: [],
          parentId: undefined,
          subSections: [],
          granularityLevel: GranularityLevel.MODEL,
        }),
      ],
      publications: [],
      marketplaceResourceId: null,
    };

    const productDataModelDraft = ProductDataModel.loadFromDb({
      ...laptopModel,
      ownedByOrganizationId: randomUUID(),
      createdByUserId: randomUUID(),
    });
    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOneOrFail(id);
    expect(found.sections[0].granularityLevel).toBeUndefined();
    expect(found.sections[1].granularityLevel).toEqual(GranularityLevel.MODEL);
  });

  it('should return product data models by name', async () => {
    const productDataModel = ProductDataModel.loadFromDb({
      ...laptopModelPlain,
      name: `${randomUUID()}-data-model`,
    });

    await service.save(productDataModel);
    const found = await service.findByName(productDataModel.name);
    expect(found).toEqual([
      {
        id: productDataModel.id,
        name: productDataModel.name,
        version: productDataModel.version,
      },
    ]);
  });

  it('should return all product data models belonging to organization and which are public', async () => {
    const laptopModel = ProductDataModel.loadFromDb({
      ...laptopModelPlain,
      visibility: VisibilityLevel.PRIVATE,
    });
    const phoneModel = ProductDataModel.loadFromDb({
      ...laptopModelPlain,
      id: randomUUID(),
      name: 'phone',
      visibility: VisibilityLevel.PRIVATE,
    });
    const otherUserId = randomUUID();
    const otherOrganizationId = randomUUID();
    const publicModel = ProductDataModel.create({
      name: 'publicModel',
      userId,
      organizationId,
      visibility: VisibilityLevel.PUBLIC,
    });

    const privateModel = ProductDataModel.create({
      name: 'privateModel',
      userId: otherUserId,
      organizationId: otherOrganizationId,
      visibility: VisibilityLevel.PRIVATE,
    });
    await service.save(laptopModel);
    await service.save(phoneModel);
    await service.save(publicModel);
    await service.save(privateModel);

    const foundAll =
      await service.findAllAccessibleByOrganization(organizationId);

    expect(foundAll).toContainEqual({
      id: laptopModel.id,
      name: laptopModel.name,
      version: laptopModel.version,
    });
    expect(foundAll).toContainEqual({
      id: phoneModel.id,
      name: phoneModel.name,
      version: phoneModel.version,
    });
    expect(foundAll).toContainEqual({
      id: publicModel.id,
      name: publicModel.name,
      version: publicModel.version,
    });
    expect(foundAll).not.toContainEqual({
      id: privateModel.id,
      name: privateModel.name,
      version: privateModel.version,
    });
  });

  afterAll(async () => {
    await mongoConnection.close();
    await module.close();
  });
});
