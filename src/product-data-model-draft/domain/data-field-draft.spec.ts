import { DataFieldDraft } from './data-field-draft';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';

describe('DataField', () => {
  it('is created', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
    });
    expect(field.id).toBeDefined();
    expect(field.type).toEqual(DataFieldType.TEXT_FIELD);
    expect(field.options).toEqual({ max: 2 });
  });

  it('is renamed', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    field.rename('Memory');
    expect(field.name).toEqual('Memory');
  });

  it('overrides options', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { min: 7, regex: '/d' },
    });
    field.mergeOptions({ max: 3, min: 9 });
    expect(field.options).toEqual({ min: 9, max: 3, regex: '/d' });
  });

  it('should publish data field draft', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { max: 2 },
    });

    const publishedField = field.publish();
    expect(publishedField).toEqual({
      ...field.toPlain(),
    });
  });
});
