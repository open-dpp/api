import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { SectionType } from '../../data-modelling/domain/section-base';
import {
  ProductDataModelDraft,
  ProductDataModelDraftDbProps,
} from '../domain/product-data-model-draft';
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
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import {
  productDataModelDraftCreatePropsFactory,
  productDataModelDraftDbFactory,
} from '../fixtures/product-data-model-draft.factory';
import { sectionDraftDbPropsFactory } from '../fixtures/section-draft.factory';

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

  const laptopModelPlain: ProductDataModelDraftDbProps =
    productDataModelDraftDbFactory.build({
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
    });

  it('saves draft', async () => {
    const productDataModelDraft = ProductDataModelDraft.loadFromDb({
      ...laptopModelPlain,
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

  const commonLayout = {
    colStart: { sm: 1 },
    colSpan: { sm: 7 },
    rowStart: { sm: 1 },
    rowSpan: { sm: 1 },
  };

  const layoutDataField = Layout.create({
    ...commonLayout,
  });
  const layout = Layout.create({
    cols: { sm: 3 },
    ...commonLayout,
  });

  it('sets correct default granularity level', async () => {
    const laptopModel: ProductDataModelDraftDbProps =
      productDataModelDraftDbFactory.build({
        sections: [
          sectionDraftDbPropsFactory.build({
            id: 's1',
            type: SectionType.GROUP,
            granularityLevel: undefined,
          }),
          sectionDraftDbPropsFactory.build({
            id: 's2',
            type: SectionType.REPEATABLE,
          }),
        ],
      });

    const productDataModelDraft = ProductDataModelDraft.loadFromDb({
      ...laptopModel,
      organizationId: randomUUID(),
      userId: randomUUID(),
    });
    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOneOrFail(id);
    expect(found.findSectionOrFail('s1').granularityLevel).toBeUndefined();
    expect(found.findSectionOrFail('s2').granularityLevel).toEqual(
      GranularityLevel.MODEL,
    );
  });

  it('should delete section on product data model draft', async () => {
    const productDataModelDraft = ProductDataModelDraft.create(
      productDataModelDraftCreatePropsFactory.build(),
    );
    const section1 = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.ITEM,
    });
    const section11 = DataSectionDraft.create({
      name: 'Dimensions',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.ITEM,
    });
    const section2 = DataSectionDraft.create({
      name: 'Traceability',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.ITEM,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSubSection(section1.id, section11);
    productDataModelDraft.addSection(section2);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.ITEM,
    });
    productDataModelDraft.addDataFieldToSection(section1.id, dataField);

    await service.save(productDataModelDraft);
    productDataModelDraft.deleteSection(section1.id);
    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOneOrFail(id);
    expect(found.sections).toEqual([section2]);
  });

  it('should delete data fields of product data model draft', async () => {
    const productDataModelDraft = ProductDataModelDraft.create(
      productDataModelDraftCreatePropsFactory.build(),
    );
    const section = DataSectionDraft.create({
      name: 'Tech specs',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(section);
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout: layoutDataField,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout: layoutDataField,
      granularityLevel: GranularityLevel.MODEL,
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
    const organizationId = randomUUID();

    const laptopDraft = ProductDataModelDraft.create(
      productDataModelDraftCreatePropsFactory.build({
        name: 'laptop',
        organizationId,
      }),
    );
    const phoneDraft = ProductDataModelDraft.create(
      productDataModelDraftCreatePropsFactory.build({
        name: 'phone',
        organizationId,
      }),
    );
    await service.save(laptopDraft);
    await service.save(phoneDraft);
    const otherOrganizationId = randomUUID();

    await service.save(
      ProductDataModelDraft.create(
        productDataModelDraftCreatePropsFactory.build({
          organizationId: otherOrganizationId,
        }),
      ),
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
