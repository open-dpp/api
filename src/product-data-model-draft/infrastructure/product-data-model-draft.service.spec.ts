import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { SectionType } from '../../data-modelling/domain/section-base';
import { ProductDataModelDraft } from '../domain/product-data-model-draft';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
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
import { Layout } from '../../data-modelling/domain/layout';

describe('ProductDataModelDraftMongoService', () => {
  let service: ProductDataModelDraftService;
  let mongoConnection: Connection;

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
  });

  const laptopModelPlain = {
    name: 'Laptop',
    version: 'v2',
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
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
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
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
      },
      {
        parentId: 's1.1',
        id: 's1.1.1',
        name: 'CO2 Scope 1',
        type: SectionType.REPEATABLE,
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            name: 'Emissions',
            type: 'TextField',
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
          },
        ],
      },
      {
        parentId: 's1',
        id: 's1.2',
        name: 'Electricity',
        type: SectionType.GROUP,
        dataFields: [],
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
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
  const layout = Layout.create({
    cols: { sm: 3 },
    colStart: { sm: 1 },
    colSpan: { sm: 7 },
    rowStart: { sm: 1 },
    rowSpan: { sm: 1 },
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
      layout,
    });
    const section11 = DataSectionDraft.create({
      name: 'Dimensions',
      type: SectionType.GROUP,
      layout,
    });
    const section2 = DataSectionDraft.create({
      name: 'Traceability',
      type: SectionType.GROUP,
      layout,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSubSection(section1.id, section11);
    productDataModelDraft.addSection(section2);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
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
      layout,
    });
    productDataModelDraft.addSection(section);
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout,
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

  afterAll(async () => {
    await mongoConnection.close(); // Close connection after tests
  });
});
