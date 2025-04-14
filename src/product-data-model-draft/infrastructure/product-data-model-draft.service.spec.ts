import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { SectionType } from '../../data-modelling/domain/section-base';
import { ProductDataModelDraft } from '../domain/product-data-model-draft';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { ProductDataModelDraftService } from './product-data-model-draft.service';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from './product-data-model-draft.schema';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { DataSectionDraft } from '../domain/section-draft';
import { DataFieldDraft } from '../domain/data-field-draft';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';

describe('ProductDataModelDraftMongoService', () => {
  let service: ProductDataModelDraftService;
  let mongoConnection: Connection;
  let productDataModelDraftDoc: mongoose.Model<ProductDataModelDraftDoc>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDraftDoc.name,
            schema: ProductDataModelDraftSchema,
          },
        ]),
      ],
      providers: [ProductDataModelDraftService],
    }).compile();
    service = module.get<ProductDataModelDraftService>(
      ProductDataModelDraftService,
    );
    mongoConnection = module.get<Connection>(getConnectionToken());
    productDataModelDraftDoc = module.get(
      getModelToken(ProductDataModelDraftDoc.name),
    );
  });

  const laptopModelPlain = {
    name: 'Laptop',
    version: 'v2',
    sections: [
      {
        id: 's1',
        name: 'Environment',
        type: SectionType.GROUP,
        dataFields: [
          {
            name: 'Serial number',
            type: 'TextField',
          },
          {
            name: 'Processor',
            type: 'TextField',
          },
        ],
        parentId: undefined,
        subSections: ['s1.1', 's1.2'],
      },
      {
        parentId: 's1',
        id: 's1.1',
        name: 'CO2',
        type: SectionType.GROUP,
        subSections: ['s1.1.1'],
        dataFields: [],
      },
      {
        parentId: 's1.1',
        id: 's1.1.1',
        name: 'CO2 Scope 1',
        type: SectionType.REPEATABLE,
        dataFields: [
          {
            name: 'Emissions',
            type: 'TextField',
          },
        ],
      },
      {
        parentId: 's1',
        id: 's1.2',
        name: 'Electricity',
        type: SectionType.GROUP,
        dataFields: [],
      },
    ],
    publications: [
      {
        id: randomUUID(),
        version: '1.0.0',
      },
      {
        id: randomUUID(),
        version: '2.0.0',
      },
    ],
  };

  it('saves draft', async () => {
    const productDataModelDraft = ProductDataModelDraft.fromPlain({
      ...laptopModelPlain,
      ownedByOrganizationId: randomUUID(),
      createdByUserId: randomUUID(),
    });
    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(productDataModelDraft);
  });

  it('fails if requested product data model draft could not be found', async () => {
    await expect(service.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(ProductDataModelDraft.name),
    );
  });

  it('should delete section on product data model draft', async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    const section1 = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    const section11 = DataSectionDraft.create({
      name: 'Dimensions',
      type: SectionType.GROUP,
    });
    const section2 = DataSectionDraft.create({
      name: 'Traceability',
      type: SectionType.GROUP,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSubSection(section1.id, section11);
    productDataModelDraft.addSection(section2);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    productDataModelDraft.addDataFieldToSection(section1.id, dataField);

    await service.save(productDataModelDraft);
    productDataModelDraft.deleteSection(section1.id);
    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOneOrFail(id);
    expect(found.sections).toEqual([section2]);
  });

  it('should delete data fields of product data model draft', async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();

    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'draft',
      organizationId,
      userId,
    });
    const section = DataSectionDraft.create({
      name: 'Tech specs',
      type: SectionType.GROUP,
    });
    productDataModelDraft.addSection(section);
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });

    productDataModelDraft.addDataFieldToSection(section.id, dataField1);
    productDataModelDraft.addDataFieldToSection(section.id, dataField2);
    await service.save(productDataModelDraft);
    productDataModelDraft.deleteDataFieldOfSection(section.id, dataField2.id);
    await service.save(productDataModelDraft);
    const found = await service.findOneOrFail(productDataModelDraft.id);
    expect(found.sections[0].dataFields).toEqual([dataField1]);
  });

  it('should return all product data model drafts by organization', async () => {
    const userId = randomUUID();

    const organizationId = randomUUID();

    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    const phoneDraft = ProductDataModelDraft.create({
      name: 'phone',
      organizationId,
      userId,
    });
    await service.save(laptopDraft);
    await service.save(phoneDraft);
    const otherOrganizationId = randomUUID();

    await service.save(
      ProductDataModelDraft.create({
        name: 'other draft',
        organizationId: otherOrganizationId,
        userId,
      }),
    );
    const foundAll = await service.findAllByOrganization(organizationId);
    expect(foundAll).toEqual([
      { id: laptopDraft.id, name: laptopDraft.name },
      { id: phoneDraft.id, name: phoneDraft.name },
    ]);
  });

  it('loads old schemas', async () => {
    const oldSchema = {
      _id: randomUUID(),
      __v: 0,
      _schemaVersion: '1.0.0',
      createdByUserId: randomUUID(),
      name: 'laptop',
      ownedByOrganizationId: randomUUID(),
      publications: [],
      sections: [
        {
          _id: randomUUID(),
          name: 'Tecs',
          type: 'Group',
          dataFields: [],
        },
      ],
      version: '1.0.0',
    };
    const oldDraft = new productDataModelDraftDoc(oldSchema);
    await oldDraft.save();
    const found = await service.findOneOrFail(oldSchema._id);
    expect(found.sections[0].toPlain()).toEqual({
      id: expect.any(String),
      name: 'Tecs',
      type: 'Group',
      dataFields: [],
      subSections: [],
      parentId: undefined,
    });
  });

  afterAll(async () => {
    await mongoConnection.close(); // Close connection after tests
  });
});
