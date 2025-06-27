import { DataFieldDraft } from './data-field-draft';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { TextField } from '../../product-data-model/domain/data-field';

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
      granularityLevel: GranularityLevel.MODEL,
    });
    expect(field.id).toBeDefined();
    expect(field.type).toEqual(DataFieldType.TEXT_FIELD);
    expect(field.options).toEqual({ max: 2 });
    expect(field.layout).toEqual(layout);
    expect(field.granularityLevel).toEqual(GranularityLevel.MODEL);
  });

  it('is renamed', () => {
    const field = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout,
      granularityLevel: GranularityLevel.MODEL,
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
      granularityLevel: GranularityLevel.MODEL,
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
      granularityLevel: GranularityLevel.MODEL,
    });

    const publishedField = field.publish();
    expect(publishedField).toEqual(
      TextField.loadFromDb({
        name: field.name,
        layout: field.layout,
        granularityLevel: field.granularityLevel,
        id: field.id,
        options: field.options,
      }),
    );
  });
});
