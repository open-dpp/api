import { Test, TestingModule } from '@nestjs/testing';
import { ProductDataModelService } from './product-data-model.service';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../domain/product.data.model';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { SectionType } from '../../data-modelling/domain/section-base';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from './product-data-model.schema';

describe('ProductDataModelService', () => {
  let service: ProductDataModelService;
  const user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({ name: 'Firma Y', user });
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDoc.name,
            schema: ProductDataModelSchema,
          },
        ]),
      ],
      providers: [ProductDataModelService],
    }).compile();
    service = module.get<ProductDataModelService>(ProductDataModelService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  const laptopModelPlain = {
    name: 'Laptop',
    version: 'v2',
    visibility: VisibilityLevel.PUBLIC,
    ownedByOrganizationId: organization.id,
    createdByUserId: user.id,
    sections: [
      {
        id: 's1',
        name: 'Environment',
        type: SectionType.GROUP,
        layout: {
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 7 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            name: 'Serial number',
            type: 'TextField',
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
          {
            name: 'Processor',
            type: 'TextField',
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
        ],
        subSections: ['s1.1'],
      },
      {
        id: 's1.1',
        parentId: 's1',
        name: 'CO2',
        type: SectionType.GROUP,
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            name: 'Consumption',
            type: 'TextField',
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
        ],
        subSections: [],
      },
    ],
  };

  it('fails if requested product data model could not be found', async () => {
    await expect(service.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(ProductDataModel.name),
    );
  });

  it('should create product data model', async () => {
    const productDataModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
    });

    const { id } = await service.save(productDataModel);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(productDataModel);
  });

  it('should return product data models by name', async () => {
    const productDataModel = ProductDataModel.fromPlain({
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
    const laptopModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
      visibility: VisibilityLevel.PRIVATE,
    });
    const phoneModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
      name: 'phone',
      visibility: VisibilityLevel.PRIVATE,
    });
    const otherUser = new User(randomUUID(), 'test@example.com');
    const otherOrganization = Organization.create({
      name: 'Firma Y',
      user: otherUser,
    });
    const publicModel = ProductDataModel.create({
      name: 'publicModel',
      user: otherUser,
      organization: otherOrganization,
      visibility: VisibilityLevel.PUBLIC,
    });

    const privateModel = ProductDataModel.create({
      name: 'privateModel',
      user: otherUser,
      organization: otherOrganization,
      visibility: VisibilityLevel.PRIVATE,
    });
    await service.save(laptopModel);
    await service.save(phoneModel);
    await service.save(publicModel);
    await service.save(privateModel);

    const foundAll =
      await service.findAllAccessibleByOrganization(organization);

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
  });
});
