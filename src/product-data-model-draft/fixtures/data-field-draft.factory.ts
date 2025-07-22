import { DataFieldDraftDbProps } from '../domain/data-field-draft';
import { Factory } from 'fishery';
import { randomUUID } from 'crypto';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { layoutPropsFactory } from '../../data-modelling/fixtures/layout.factory';

export const dataFieldDraftDbPropsFactory =
  Factory.define<DataFieldDraftDbProps>(({ params }) => ({
    id: randomUUID(),
    type: DataFieldType.TEXT_FIELD,
    name: 'Title',
    options: { max: 2 },
    layout: Layout.create(layoutPropsFactory.build()),
    granularityLevel: GranularityLevel.MODEL,
  }));

export const textFieldProps = dataFieldDraftDbPropsFactory.params({
  type: DataFieldType.TEXT_FIELD,
});

export const numericFieldProps = dataFieldDraftDbPropsFactory.params({
  type: DataFieldType.NUMERIC_FIELD,
});
