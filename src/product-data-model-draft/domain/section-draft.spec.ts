import { DataSectionDraft } from './section-draft';
import { DataFieldDraft } from './data-field-draft';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { GroupSection } from '../../product-data-model/domain/section';

describe('DataSectionDraft', () => {
  const layout = Layout.create({
    cols: { sm: 1 },
    colStart: { sm: 1 },
    colSpan: { sm: 1 },
    rowSpan: { sm: 1 },
    rowStart: { sm: 1 },
  });
  it('is created', () => {
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
    expect(section1.id).toBeDefined();
    expect(section1.type).toEqual(SectionType.GROUP);
    expect(section1.dataFields).toEqual([]);
    expect(section1.parentId).toBeUndefined();
    expect(section1.layout).toEqual(layout);
    expect(section1.granularityLevel).toEqual(GranularityLevel.MODEL);
    expect(section1.subSections).toEqual([]);
    expect(section2.id).toBeDefined();
    expect(section2.type).toEqual(SectionType.REPEATABLE);
    expect(section2.layout).toEqual(layout);
    expect(section2.granularityLevel).toEqual(GranularityLevel.MODEL);
  });

  it('fails on creation if no granularity level is set for repeater section', () => {
    expect(() =>
      DataSectionDraft.create({
        name: 'Material',
        type: SectionType.REPEATABLE,
        layout,
      }),
    ).toThrow(new ValueError('Repeatable must have a granularity level'));
  });

  it('is renamed', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.rename('Tracebility');
    expect(section.name).toEqual('Tracebility');
  });

  it('should add data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addDataField(dataField1);
    section.addDataField(dataField2);
    expect(section.dataFields).toEqual([dataField1, dataField2]);
  });

  it('fails to add data field if granularity level of section and data field do not match', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.ITEM,
    });
    expect(() => section.addDataField(dataField)).toThrow(
      new ValueError(
        `Data field ${dataField.id} has a granularity level of ${dataField.granularityLevel} which does not match the section's granularity level of ${section.granularityLevel}`,
      ),
    );
  });

  it('should modify data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addDataField(dataField1);
    section.addDataField(dataField2);
    section.modifyDataField(dataField1.id, {
      name: 'newName',
      options: { min: 3 },
      layout: {
        colStart: { sm: 2 },
        colSpan: { sm: 7 },
        rowStart: { sm: 1 },
        rowSpan: { sm: 8 },
      },
    });
    expect(section.dataFields).toEqual([
      DataFieldDraft.loadFromDb({
        id: dataField1.id,
        type: dataField1.type,
        granularityLevel: dataField1.granularityLevel,
        name: 'newName',
        options: { min: 3, max: 2 },
        layout: Layout.create({
          cols: { sm: 1 },
          colStart: { sm: 2 },
          colSpan: { sm: 7 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 8 },
        }),
      }),
      dataField2,
    ]);
  });

  it('should modify data field fails if not found', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addDataField(dataField1);
    expect(() =>
      section.modifyDataField('unknown-id', {
        name: 'newName',
        options: { min: 3 },
        layout: {
          colStart: { sm: 2 },
          colSpan: { sm: 7 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 8 },
        },
      }),
    ).toThrow(new NotFoundError(DataFieldDraft.name, 'unknown-id'));
  });

  it('should delete data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
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
    const dataField3 = DataFieldDraft.create({
      name: 'Storage',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addDataField(dataField1);
    section.addDataField(dataField2);
    section.addDataField(dataField3);
    section.deleteDataField(dataField2.id);
    expect(section.dataFields).toEqual([dataField1, dataField3]);
  });

  it('should fail to delete data field if id not exists', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addDataField(dataField1);

    expect(() => section.deleteDataField('no-id')).toThrow(
      new NotFoundError(DataFieldDraft.name, 'no-id'),
    );
  });

  it('should add child section', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const childSection1 = DataSectionDraft.create({
      name: 'Sub specification 1',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const childSection2 = DataSectionDraft.create({
      name: 'Sub specification 2',
      type: SectionType.REPEATABLE,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addSubSection(childSection1);
    section.addSubSection(childSection2);
    expect(section.subSections).toEqual([childSection1.id, childSection2.id]);
    expect(childSection1.parentId).toEqual(section.id);
    expect(childSection2.parentId).toEqual(section.id);
  });

  it('should delete sub section', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const childSection1 = DataSectionDraft.create({
      name: 'Sub specification 1',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const childSection2 = DataSectionDraft.create({
      name: 'Sub specification 2',
      type: SectionType.REPEATABLE,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addSubSection(childSection1);
    section.addSubSection(childSection2);
    const result = section.deleteSubSection(childSection1);
    expect(section.subSections).toEqual([childSection2.id]);
    expect(result.parentId).toBeUndefined();

    // errors
    expect(() => section.deleteSubSection(childSection1)).toThrow(
      new ValueError(
        `Could not found and delete sub section ${childSection1.id} from ${section.id}`,
      ),
    );
  });

  it('should publish section draft', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    const subSection = DataSectionDraft.create({
      name: 'Dimensions',
      type: SectionType.GROUP,
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addSubSection(subSection);
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
      granularityLevel: GranularityLevel.MODEL,
    });
    section.addDataField(dataField1);
    const publishedSection = section.publish();
    expect(publishedSection).toEqual(
      GroupSection.loadFromDb({
        id: section.id,
        parentId: undefined,
        name: 'Technical specification',
        dataFields: [dataField1.publish()],
        subSections: [subSection.id],
        layout: layout,
        granularityLevel: GranularityLevel.MODEL,
      }),
    );

    const publishedSubSection = subSection.publish();
    expect(publishedSubSection).toEqual(
      GroupSection.loadFromDb({
        id: subSection.id,
        name: 'Dimensions',
        dataFields: [],
        subSections: [],
        parentId: section.id,
        layout: layout,
        granularityLevel: GranularityLevel.MODEL,
      }),
    );
  });
});
