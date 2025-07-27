import { sectionBaseDocumentation } from '../data-modelling/presentation/dto/docs/section-base.doc';

export const templateDocumentation = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    version: {
      type: 'string',
      minLength: 1,
    },
    sections: {
      type: 'array',
      items: { ...sectionBaseDocumentation },
    },
    createdByUserId: {
      type: 'string',
      format: 'uuid',
    },
    ownedByOrganizationId: {
      type: 'string',
      format: 'uuid',
    },
    marketplaceResourceId: {
      type: 'string',
      format: 'uuid',
    },
  },
  required: [
    'id',
    'name',
    'version',
    'sections',
    'createdByUserId',
    'ownedByOrganizationId',
  ],
};

export const templateGetAllDocumentation = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    name: {
      type: 'string',
    },
    version: { type: 'string', minLength: 1 },
  },
};
