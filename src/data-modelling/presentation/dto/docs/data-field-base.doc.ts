import { DataFieldType } from '../../../domain/data-field-base';
import { GranularityLevel } from '../../../domain/granularity-level';
import { layoutDocumentation } from './layout.doc';

export const dataFieldDocumentation = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    type: {
      type: 'string',
      enum: Object.values(DataFieldType),
    },
    options: {
      type: 'object',
      nullable: true,
      description: 'Optional key-value pairs with string keys',
      additionalProperties: true,
    },
    granularityLevel: {
      type: 'string',
      enum: Object.values(GranularityLevel),
      nullable: true,
    },
    layout: layoutDocumentation,
  },
};
