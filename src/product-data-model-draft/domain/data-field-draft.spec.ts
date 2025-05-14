import { DataFieldDraft } from './data-field-draft';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { Layout } from '../../data-modelling/domain/layout';

describe('DataField', () => {
  const layout = Layout.create({
    cols: { sm: 1 },
    colStart: { sm: 1 },
    colSpan: { sm: 1 },
    rowSpan: { sm: 1 },
    rowStart: { sm: 1 },
  });
  it('is created', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
    });
    expect(field.id).toBeDefined();
    expect(field.type).toEqual(DataFieldType.TEXT_FIELD);
    expect(field.options).toEqual({ max: 2 });
    expect(field.layout).toEqual(layout);
  });

  it('is renamed', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
    });
    field.rename('Memory');
    expect(field.name).toEqual('Memory');
  });

  it('overrides options', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { min: 7, regex: '/d' },
      layout,
    });
    field.mergeOptions({ max: 3, min: 9 });
    expect(field.options).toEqual({ min: 9, max: 3, regex: '/d' });
  });

  it('should publish data field draft', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
      layout,
    });

    const publishedField = field.publish();
    expect(publishedField).toEqual({
      ...field.toPlain(),
    });
  });
});
