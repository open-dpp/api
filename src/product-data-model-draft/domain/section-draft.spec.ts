import { DataSectionDraft } from './section-draft';
import { DataFieldDraft } from './data-field-draft';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import { Layout } from '../../data-modelling/domain/layout';

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
    });
    const section2 = DataSectionDraft.create({
      name: 'Material',
      type: SectionType.REPEATABLE,
      layout,
    });
    expect(section1.id).toBeDefined();
    expect(section1.type).toEqual(SectionType.GROUP);
    expect(section1.dataFields).toEqual([]);
    expect(section1.parentId).toBeUndefined();
    expect(section1.layout).toEqual(layout);
    expect(section1.subSections).toEqual([]);
    expect(section2.id).toBeDefined();
    expect(section2.type).toEqual(SectionType.REPEATABLE);
    expect(section2.layout).toEqual(layout);
  });

  it('is renamed', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
    });
    section.rename('Tracebility');
    expect(section.name).toEqual('Tracebility');
  });

  it('should add data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout,
    });
    section.addDataField(dataField1);
    section.addDataField(dataField2);
    expect(section.dataFields).toEqual([dataField1, dataField2]);
  });

  it('should modify data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
      layout,
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
    expect(section.toPlain().dataFields).toEqual([
      {
        ...dataField1.toPlain(),
        name: 'newName',
        options: { min: 3, max: 2 },
        layout: {
          cols: { sm: 1 },
          colStart: { sm: 2 },
          colSpan: { sm: 7 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 8 },
        },
      },
      dataField2.toPlain(),
    ]);
  });

  it('should modify data field fails if not found', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
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
    });
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
    const dataField3 = DataFieldDraft.create({
      name: 'Storage',
      type: DataFieldType.TEXT_FIELD,
      layout,
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
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
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
    });
    const childSection1 = DataSectionDraft.create({
      name: 'Sub specification 1',
      type: SectionType.GROUP,
      layout,
    });
    const childSection2 = DataSectionDraft.create({
      name: 'Sub specification 2',
      type: SectionType.REPEATABLE,
      layout,
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
    });
    const childSection1 = DataSectionDraft.create({
      name: 'Sub specification 1',
      type: SectionType.GROUP,
      layout,
    });
    const childSection2 = DataSectionDraft.create({
      name: 'Sub specification 2',
      type: SectionType.REPEATABLE,
      layout,
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
    });
    const subSection = DataSectionDraft.create({
      name: 'Dimensions',
      type: SectionType.GROUP,
      layout,
    });
    section.addSubSection(subSection);
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
    });
    section.addDataField(dataField1);
    const publishedSection = section.publish();
    expect(publishedSection).toEqual({
      id: section.id,
      name: 'Technical specification',
      type: SectionType.GROUP,
      dataFields: [{ ...dataField1.publish() }],
      subSections: [subSection.id],
      layout: layout.toPlain(),
    });

    const publishedSubSection = subSection.publish();
    expect(publishedSubSection).toEqual({
      id: subSection.id,
      name: 'Dimensions',
      type: SectionType.GROUP,
      dataFields: [],
      subSections: [],
      parentId: section.id,
      layout: layout.toPlain(),
    });
  });
});
