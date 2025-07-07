import { sectionBaseDocumentation } from '../data-modelling/presentation/dto/docs/section-base.doc';
import { VisibilityLevel } from '../product-data-model/domain/product.data.model';

export const productDataModelDocumentation = {
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
    visibility: {
      type: 'string',
      enum: Object.values(VisibilityLevel),
    },
    createdByUserId: {
      type: 'string',
      format: 'uuid',
    },
    ownedByOrganizationId: {
      type: 'string',
      format: 'uuid',
    },
  },
  required: [
    'id',
    'name',
    'version',
    'sections',
    'visibility',
    'createdByUserId',
    'ownedByOrganizationId',
  ],
};

export const productDataModelGetAllDocumentation = {
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
