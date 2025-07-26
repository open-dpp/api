import { Factory } from 'fishery';
import { DataFieldDbProps } from '../domain/data-field';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '@open-dpp/api-client';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { randomUUID } from 'crypto';

export const dataFieldDbPropsFactory = Factory.define<DataFieldDbProps>(() => ({
  id: randomUUID(),
  type: DataFieldType.TEXT_FIELD,
  name: 'Processor',
  layout: Layout.create({
    colStart: { sm: 1 },
    colSpan: { sm: 1 },
    rowStart: { sm: 1 },
    rowSpan: { sm: 1 },
  }),
  granularityLevel: GranularityLevel.MODEL,
}));
