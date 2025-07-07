import { dataFieldDocumentation } from './data-field-base.doc';
import { SectionType } from '../../../domain/section-base';
import { GranularityLevel } from '../../../domain/granularity-level';
import { layoutDocumentation } from './layout.doc';

export const sectionBaseDocumentation = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    type: {
      type: 'string',
      enum: Object.values(SectionType),
      description: 'The section type',
    },
    parentId: { type: 'string', nullable: true },
    subSections: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    dataFields: {
      type: 'array',
      items: dataFieldDocumentation,
    },
    granularityLevel: {
      type: 'string',
      enum: Object.values(GranularityLevel),
      nullable: true,
    },
    layout: layoutDocumentation,
  },
};
