import { DataSectionDraft } from './section.draft';
import { DataFieldDraft } from './data.field.draft';
import { SectionType } from '../../product-data-model/domain/section';
import { DataFieldType } from '../../product-data-model/domain/data.field';
import { NotFoundError } from '../../exceptions/domain.errors';

describe('DataSectionDraft', () => {
  it('is created', () => {
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const section2 = DataSectionDraft.create({
      name: 'Material',
      type: SectionType.REPEATABLE,
    });
    expect(section1.id).toBeDefined();
    expect(section1.type).toEqual(SectionType.GROUP);
    expect(section1.dataFields).toEqual([]);
    expect(section2.id).toBeDefined();
    expect(section2.type).toEqual(SectionType.REPEATABLE);
    expect(section2.dataFields).toEqual([]);
  });

  it('is renamed', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    section.rename('Tracebility');
    expect(section.name).toEqual('Tracebility');
  });

  it('should add data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });
    section.addDataField(dataField1);
    section.addDataField(dataField2);
    expect(section.dataFields).toEqual([dataField1, dataField2]);
  });

  it('should modify data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });
    section.addDataField(dataField1);
    section.addDataField(dataField2);
    section.modifyDataField(dataField1.id, {
      name: 'newName',
      options: { min: 3 },
    });
    expect(section.toPlain().dataFields).toEqual([
      {
        ...dataField1.toPlain(),
        name: 'newName',
        options: { min: 3, max: 2 },
      },
      dataField2.toPlain(),
    ]);
  });

  it('should modify data field fails if not found', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
    });
    section.addDataField(dataField1);
    expect(() =>
      section.modifyDataField('unknown-id', {
        name: 'newName',
        options: { min: 3 },
      }),
    ).toThrow(new NotFoundError(DataFieldDraft.name, 'unknown-id'));
  });

  it('should delete data field', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });
    const dataField3 = DataFieldDraft.create({
      name: 'Storage',
      type: DataFieldType.TEXT_FIELD,
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
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    section.addDataField(dataField1);

    expect(() => section.deleteDataField('no-id')).toThrow(
      new NotFoundError(DataFieldDraft.name, 'no-id'),
    );
  });

  it('should publish section draft', () => {
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
    });
    section.addDataField(dataField1);
    const publishedSection = section.publish();
    expect(publishedSection).toEqual({
      id: undefined,
      name: 'Technical specification',
      type: SectionType.GROUP,
      dataFields: [{ ...dataField1.publish() }],
    });
  });
});
