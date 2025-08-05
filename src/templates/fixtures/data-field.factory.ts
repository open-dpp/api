import { Factory } from 'fishery';
import { DataFieldDbProps } from '../domain/data-field';
import { GranularityLevel } from '@open-dpp/api-client';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { randomUUID } from 'crypto';

export const dataFieldDbPropsFactory = Factory.define<DataFieldDbProps>(() => ({
  id: randomUUID(),
  type: DataFieldType.TEXT_FIELD,
  name: 'Processor',
  granularityLevel: GranularityLevel.MODEL,
}));
