import { TemplateDraft, TemplateDraftDbProps } from './template-draft';
import { DataFieldDraft } from './data-field-draft';
import { DataSectionDraft } from './section-draft';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { randomUUID } from 'crypto';
import { Template, TemplateDbProps } from '../../templates/domain/template';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import {
  templateDraftCreatePropsFactory,
  templateDraftDbFactory,
} from '../fixtures/template-draft.factory';
import { textFieldProps } from '../fixtures/data-field-draft.factory';
import {
  sectionDraftDbPropsFactory,
  sectionDraftEnvironment,
  sectionDraftFactoryIds,
} from '../fixtures/section-draft.factory';
import { Sector } from '@open-dpp/api-client';

describe('ProductDataModelDraft', () => {
  const userId = randomUUID();
  const organizationId = randomUUID();
  const laptopModel: TemplateDraftDbProps = templateDraftDbFactory.build({
    userId,
    organizationId,
  });

  it('is renamed', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build(),
    );
    productDataModelDraft.rename('Final Draft');
    expect(productDataModelDraft.name).toEqual('Final Draft');
  });

  it('is published', () => {
    const productDataModelDraft = TemplateDraft.loadFromDb(laptopModel);
    const otherUserId = randomUUID();
    const publishedProductDataModel =
      productDataModelDraft.publish(otherUserId);

    const expected: TemplateDbProps = {
      id: expect.any(String),
      marketplaceResourceId: null,
      name: productDataModelDraft.name,
      description: productDataModelDraft.description,
      sectors: [Sector.ELECTRONICS],
      version: '1.0.0',
      organizationId: organizationId,
      userId: otherUserId,
      sections: [
        {
          type: SectionType.GROUP,
          parentId: undefined,
          subSections: [],
          id: productDataModelDraft.sections[0].id,
          granularityLevel: GranularityLevel.MODEL,
          name: 'Umwelt',
          layout: {
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowSpan: { sm: 1 },
            rowStart: { sm: 1 },
          },
          dataFields: [
            {
              type: DataFieldType.TEXT_FIELD,
              id: productDataModelDraft.sections[0].dataFields[0].id,
              name: 'Title 1',
              options: { max: 2 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              },
              granularityLevel: GranularityLevel.MODEL,
            },
            {
              type: DataFieldType.TEXT_FIELD,
              id: productDataModelDraft.sections[0].dataFields[1].id,
              name: 'Title 2',
              options: { max: 2 },
              layout: {
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              },
              granularityLevel: GranularityLevel.MODEL,
            },
          ],
        },
        {
          type: SectionType.REPEATABLE,
          parentId: undefined,
          subSections: [productDataModelDraft.sections[2].id],
          name: 'Material',
          granularityLevel: GranularityLevel.MODEL,
          id: productDataModelDraft.sections[1].id,
          layout: {
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowSpan: { sm: 1 },
            rowStart: { sm: 1 },
          },
          dataFields: [
            {
              type: DataFieldType.TEXT_FIELD,
              id: productDataModelDraft.sections[1].dataFields[0].id,
              name: 'Material Title 1',
              options: { max: 2 },
              layout: Layout.create({
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            },
            {
              type: DataFieldType.TEXT_FIELD,
              id: productDataModelDraft.sections[1].dataFields[1].id,
              name: 'Material Title 2',
              options: { max: 2 },
              layout: Layout.create({
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            },
          ],
        },
        {
          type: SectionType.GROUP,
          parentId: productDataModelDraft.sections[1].id,
          subSections: [],
          name: 'Measurement',
          granularityLevel: GranularityLevel.MODEL,
          id: productDataModelDraft.sections[2].id,
          layout: {
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowSpan: { sm: 1 },
            rowStart: { sm: 1 },
          },
          dataFields: [
            {
              type: DataFieldType.TEXT_FIELD,
              id: productDataModelDraft.sections[2].dataFields[0].id,
              name: 'Measurement Title 1',
              options: { max: 2 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              },
              granularityLevel: GranularityLevel.MODEL,
            },
            {
              type: DataFieldType.TEXT_FIELD,
              id: productDataModelDraft.sections[2].dataFields[1].id,
              name: 'Measurement Title 2',
              options: { max: 2 },
              layout: {
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              },
              granularityLevel: GranularityLevel.MODEL,
            },
          ],
        },
      ],
    };
    expect(publishedProductDataModel).toEqual(Template.loadFromDb(expected));
    expect(publishedProductDataModel.id).not.toEqual(productDataModelDraft.id);
    expect(productDataModelDraft.publications).toEqual([
      {
        id: publishedProductDataModel.id,
        version: '1.0.0',
      },
    ]);
    const againPublished = productDataModelDraft.publish(otherUserId);
    expect(againPublished.version).toEqual('2.0.0');
    expect(productDataModelDraft.publications).toEqual([
      {
        id: publishedProductDataModel.id,
        version: '1.0.0',
      },
      {
        id: againPublished.id,
        version: '2.0.0',
      },
    ]);
    const parentSection = publishedProductDataModel.sections.find(
      (s) => s.name === 'Material',
    );
    const childSection = publishedProductDataModel.sections.find(
      (s) => s.name === 'Measurement',
    );
    expect(parentSection.subSections).toEqual([childSection.id]);
    expect(childSection.parentId).toEqual(parentSection.id);
  });

  it('should be created', () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    expect(productDataModelDraft.id).toBeDefined();
    expect(productDataModelDraft.version).toEqual('1.0.0');
    expect(productDataModelDraft.sections).toEqual([]);
    expect(productDataModelDraft.isOwnedBy(organizationId)).toBeTruthy();
    expect(productDataModelDraft.createdByUserId).toEqual(userId);
    expect(productDataModelDraft.publications).toEqual([]);
  });

  const layout = Layout.create({
    cols: { sm: 2 },
    colStart: { sm: 1 },
    colSpan: { sm: 1 },
    rowSpan: { sm: 1 },
    rowStart: { sm: 1 },
  });

  it('should add sections', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section2 = DataSectionDraft.create({
      name: 'Material',
      type: SectionType.REPEATABLE,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSection(section2);

    expect(productDataModelDraft.sections).toEqual([section1, section2]);
  });

  it('should fail to add repeater section with parent', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section2 = DataSectionDraft.create({
      name: 'Material',
      type: SectionType.REPEATABLE,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section2.assignParent(section1);
    productDataModelDraft.addSection(section1);
    expect(() => productDataModelDraft.addSection(section2)).toThrow(
      new ValueError('Repeater section can only be added as root section'),
    );
  });

  it('should add subSection', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section2 = DataSectionDraft.create({
      name: 'Material',
      type: SectionType.REPEATABLE,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSubSection(section1.id, section2);

    expect(productDataModelDraft.sections[0].subSections).toEqual([
      section2.id,
    ]);
    expect(productDataModelDraft.sections[1].parentId).toEqual(section1.id);
  });

  it('should fail to add subSection if parent id not found', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });

    expect(() =>
      productDataModelDraft.addSubSection('some id', section1),
    ).toThrow(new NotFoundError(DataSectionDraft.name, 'some id'));
  });

  it('should fail to add subSection if its granularity level differs from parent', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const parentSection = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(parentSection);
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.ITEM,
    });

    expect(() =>
      productDataModelDraft.addSubSection(parentSection.id, section),
    ).toThrow(
      new ValueError(
        `Sub section ${section.id} has a granularity level of ${section.granularityLevel} which does not match the parent section's  granularity level of ${parentSection.granularityLevel}`,
      ),
    );
  });

  it('should set subSection granularity level to parent one if undefined', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const parentSection = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(parentSection);
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
    });
    productDataModelDraft.addSubSection(parentSection.id, section);

    expect(
      productDataModelDraft.findSectionOrFail(section.id).granularityLevel,
    ).toEqual(parentSection.granularityLevel);
  });

  it('should modify section', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(section);
    const newLayout = {
      cols: { sm: 2 },
      colStart: { sm: 1 },
      colSpan: { sm: 1 },
      rowSpan: { sm: 1 },
      rowStart: { sm: 1 },
    };
    productDataModelDraft.modifySection(section.id, {
      name: 'Tracebility',
      layout: newLayout,
    });

    expect(productDataModelDraft.sections).toEqual([
      DataSectionDraft.loadFromDb({
        name: 'Tracebility',
        layout: Layout.create(newLayout),
        id: section.id,
        type: section.type,
        subSections: section.subSections,
        parentId: section.parentId,
        dataFields: section.dataFields,
        granularityLevel: section.granularityLevel,
      }),
    ]);
  });

  it('should delete a section', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section11 = DataSectionDraft.create({
      name: 'Dimensions',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section12 = DataSectionDraft.create({
      name: 'section12',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section111 = DataSectionDraft.create({
      name: 'Measurement',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section112 = DataSectionDraft.create({
      name: 'Measurement 2',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const section2 = DataSectionDraft.create({
      name: 'section2',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSubSection(section1.id, section11);
    productDataModelDraft.addSubSection(section1.id, section12);
    productDataModelDraft.addSubSection(section11.id, section111);
    productDataModelDraft.addSubSection(section11.id, section112);

    productDataModelDraft.addSection(section2);

    productDataModelDraft.deleteSection(section11.id);
    expect(section1.subSections).toEqual([section12.id]);
    productDataModelDraft.deleteSection(section1.id);

    expect(productDataModelDraft.sections).toEqual([
      section2,
      // {
      //   dataFields: [],
      //   id: section2.id,
      //   name: 'section2',
      //   subSections: [],
      //   type: 'Group',
      //   layout: {
      //     cols: { sm: 2 },
      //     colStart: { sm: 1 },
      //     colSpan: { sm: 1 },
      //     rowSpan: { sm: 1 },
      //     rowStart: { sm: 1 },
      //   },
      //   granularityLevel: GranularityLevel.MODEL,
      // },
    ]);
  });

  it('should fail to delete a section if it could not be found', () => {
    const productDataModelDraft = TemplateDraft.create(
      templateDraftCreatePropsFactory.build({ organizationId, userId }),
    );
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    productDataModelDraft.addSection(section);

    expect(() => productDataModelDraft.deleteSection('unknown-id')).toThrow(
      new ValueError('Could not found and delete section with id unknown-id'),
    );
  });

  it('should add field', () => {
    const productDataModelDraft = TemplateDraft.loadFromDb({
      ...templateDraftDbFactory.build(),
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });

    productDataModelDraft.addDataFieldToSection(
      sectionDraftFactoryIds.environment,
      dataField1,
    );
    productDataModelDraft.addDataFieldToSection(
      sectionDraftFactoryIds.environment,
      dataField2,
    );

    const existingFields = sectionDraftEnvironment
      .build()
      .dataFields.map((d) => DataFieldDraft.loadFromDb(d));
    expect(
      productDataModelDraft.findSectionOrFail(
        sectionDraftFactoryIds.environment,
      ).dataFields,
    ).toEqual([...existingFields, dataField1, dataField2]);

    expect(() =>
      productDataModelDraft.addDataFieldToSection(
        'not-found-section',
        dataField1,
      ),
    ).toThrow(new NotFoundError(DataSectionDraft.name, 'not-found-section'));
  });

  it('should delete data field', () => {
    const dataFieldProps1 = textFieldProps.build({ name: 'Processor' });
    const dataFieldProps2 = textFieldProps.build({ name: 'Memory' });
    const productDataModelDraft = TemplateDraft.loadFromDb(
      templateDraftDbFactory.build({
        sections: [
          sectionDraftDbPropsFactory.build({
            id: 'section-1',
            name: 'section-1',
            dataFields: [dataFieldProps1, dataFieldProps2],
          }),
          sectionDraftEnvironment.build(),
        ],
      }),
    );

    productDataModelDraft.deleteDataFieldOfSection(
      'section-1',
      dataFieldProps1.id,
    );
    expect(
      productDataModelDraft.findSectionOrFail('section-1').dataFields,
    ).toEqual([DataFieldDraft.loadFromDb(dataFieldProps2)]);
  });
});
