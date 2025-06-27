import {
  ProductDataModelDraft,
  ProductDataModelDraftDbProps,
} from './product-data-model-draft';
import { DataFieldDraft } from './data-field-draft';
import { DataSectionDraft } from './section-draft';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { randomUUID } from 'crypto';
import {
  ProductDataModel,
  ProductDataModelDbProps,
  VisibilityLevel,
} from '../../product-data-model/domain/product.data.model';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import {
  GroupSection,
  RepeaterSection,
} from '../../product-data-model/domain/section';
import { TextField } from '../../product-data-model/domain/data-field';

describe('ProductDataModelDraft', () => {
  const userId = randomUUID();
  const organizationId = randomUUID();
  const laptopModel: ProductDataModelDraftDbProps = {
    id: randomUUID(),
    publications: [],
    name: 'Laptop',
    version: '1.0.0',
    organizationId: organizationId,
    userId: userId,
    sections: [
      DataSectionDraft.loadFromDb({
        id: randomUUID(),
        parentId: undefined,
        type: SectionType.GROUP,
        name: 'Umwelt',
        layout: Layout.create({
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowSpan: { sm: 1 },
          rowStart: { sm: 1 },
        }),
        dataFields: [
          DataFieldDraft.create({
            type: DataFieldType.TEXT_FIELD,
            name: 'Title',
            options: { max: 2 },
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          DataFieldDraft.create({
            type: DataFieldType.TEXT_FIELD,
            name: 'Title 2',
            options: { min: 2 },
            layout: Layout.create({
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
        subSections: [],
      }),
      DataSectionDraft.loadFromDb({
        id: 'm1',
        parentId: undefined,
        name: 'Material',
        type: SectionType.REPEATABLE,
        layout: Layout.create({
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowSpan: { sm: 1 },
          rowStart: { sm: 1 },
        }),
        dataFields: [
          DataFieldDraft.create({
            type: DataFieldType.TEXT_FIELD,
            name: 'rep field 1',
            options: {},
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          DataFieldDraft.create({
            type: DataFieldType.TEXT_FIELD,
            name: 'rep field 2',
            options: {},
            layout: Layout.create({
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
        subSections: ['m1.1'],
      }),
      DataSectionDraft.loadFromDb({
        id: 'm1.1',
        parentId: 'm1',
        name: 'Measurement',
        type: SectionType.GROUP,
        layout: Layout.create({
          cols: { sm: 4 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowSpan: { sm: 1 },
          rowStart: { sm: 1 },
        }),
        dataFields: [
          DataFieldDraft.create({
            type: DataFieldType.TEXT_FIELD,
            name: 'rep field 1',
            options: {},
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          DataFieldDraft.create({
            type: DataFieldType.TEXT_FIELD,
            name: 'rep field 2',
            options: {},
            layout: Layout.create({
              colStart: { sm: 2 },
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
        subSections: [],
      }),
    ],
  };

  it('is renamed', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'My Draft',
      userId,
      organizationId,
    });
    productDataModelDraft.rename('Final Draft');
    expect(productDataModelDraft.name).toEqual('Final Draft');
  });

  it('is published', () => {
    const productDataModelDraft = ProductDataModelDraft.loadFromDb(laptopModel);
    const otherUserId = randomUUID();
    const publishedProductDataModel = productDataModelDraft.publish(
      otherUserId,
      VisibilityLevel.PUBLIC,
    );

    const expected: ProductDataModelDbProps = {
      name: productDataModelDraft.name,
      id: expect.any(String),
      version: '1.0.0',
      ownedByOrganizationId: organizationId,
      createdByUserId: otherUserId,
      visibility: VisibilityLevel.PUBLIC,
      sections: [
        GroupSection.loadFromDb({
          parentId: undefined,
          subSections: [],
          id: productDataModelDraft.sections[0].id,
          name: 'Umwelt',
          layout: Layout.create({
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowSpan: { sm: 1 },
            rowStart: { sm: 1 },
          }),
          dataFields: [
            TextField.loadFromDb({
              id: productDataModelDraft.sections[0].dataFields[0].id,
              name: 'Title',
              options: { max: 2 },
              layout: Layout.create({
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            }),
            TextField.loadFromDb({
              id: productDataModelDraft.sections[0].dataFields[1].id,
              name: 'Title 2',
              options: { min: 2 },
              layout: Layout.create({
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            }),
          ],
        }),
        RepeaterSection.loadFromDb({
          parentId: undefined,
          subSections: [productDataModelDraft.sections[2].id],
          name: 'Material',
          id: productDataModelDraft.sections[1].id,
          layout: Layout.create({
            cols: { sm: 2 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowSpan: { sm: 1 },
            rowStart: { sm: 1 },
          }),
          dataFields: [
            TextField.loadFromDb({
              id: productDataModelDraft.sections[1].dataFields[0].id,
              name: 'rep field 1',
              options: {},
              layout: Layout.create({
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            }),
            TextField.loadFromDb({
              id: productDataModelDraft.sections[1].dataFields[1].id,
              name: 'rep field 2',
              options: {},
              layout: Layout.create({
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            }),
          ],
        }),
        GroupSection.loadFromDb({
          parentId: productDataModelDraft.sections[1].id,
          subSections: [],
          name: 'Measurement',
          id: productDataModelDraft.sections[2].id,
          layout: Layout.create({
            cols: { sm: 4 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowSpan: { sm: 1 },
            rowStart: { sm: 1 },
          }),
          dataFields: [
            TextField.loadFromDb({
              id: productDataModelDraft.sections[2].dataFields[0].id,
              name: 'rep field 1',
              options: {},
              layout: Layout.create({
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            }),
            TextField.loadFromDb({
              id: productDataModelDraft.sections[2].dataFields[1].id,
              name: 'rep field 2',
              options: {},
              layout: Layout.create({
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowSpan: { sm: 1 },
                rowStart: { sm: 1 },
              }),
              granularityLevel: GranularityLevel.MODEL,
            }),
          ],
        }),
      ],
    };
    expect(publishedProductDataModel).toEqual(
      ProductDataModel.loadFromDb(expected),
    );
    expect(publishedProductDataModel.id).not.toEqual(productDataModelDraft.id);
    expect(productDataModelDraft.publications).toEqual([
      {
        id: publishedProductDataModel.id,
        version: '1.0.0',
      },
    ]);
    const againPublished = productDataModelDraft.publish(
      otherUserId,
      VisibilityLevel.PRIVATE,
    );
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Handy',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organizationId,
      userId,
    });
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
    const productDataModelDraft = ProductDataModelDraft.loadFromDb({
      id: 'product-1',
      name: 'Laptop',
      version: '1.0',
      publications: [],
      organizationId: organizationId,
      userId: userId,
      sections: [
        DataSectionDraft.loadFromDb({
          id: 'section-1',
          name: 'Section 1',
          parentId: undefined,
          subSections: [],

          layout,
          type: SectionType.GROUP,
          dataFields: [],
        }),
        DataSectionDraft.loadFromDb({
          id: 'section-2',
          name: 'Section 2',
          parentId: undefined,
          subSections: [],
          layout,
          type: SectionType.REPEATABLE,
          dataFields: [],
        }),
      ],
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

    productDataModelDraft.addDataFieldToSection('section-1', dataField1);
    productDataModelDraft.addDataFieldToSection('section-1', dataField2);

    expect(
      productDataModelDraft.findSectionOrFail('section-1').dataFields,
    ).toEqual([dataField1, dataField2]);

    expect(() =>
      productDataModelDraft.addDataFieldToSection('section-3', dataField1),
    ).toThrow(new NotFoundError(DataSectionDraft.name, 'section-3'));
  });

  it('should delete data field', () => {
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
    const productDataModelDraft = ProductDataModelDraft.loadFromDb({
      id: 'product-1',
      name: 'Laptop',
      version: '1.0',
      publications: [],
      organizationId: organizationId,
      userId: userId,
      sections: [
        DataSectionDraft.loadFromDb({
          id: 'section-1',
          name: 'Section 1',
          parentId: undefined,
          subSections: [],
          layout,
          type: SectionType.GROUP,
          dataFields: [dataField1, dataField2],
        }),
        DataSectionDraft.loadFromDb({
          parentId: undefined,
          subSections: [],
          layout,
          id: 'section-2',
          name: 'Section 2',
          type: SectionType.REPEATABLE,
          dataFields: [],
        }),
      ],
    });

    productDataModelDraft.deleteDataFieldOfSection('section-1', dataField1.id);
    expect(
      productDataModelDraft.findSectionOrFail('section-1').dataFields,
    ).toEqual([dataField2]);
  });
});
