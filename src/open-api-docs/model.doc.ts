import {
  dataValueDocumentation,
  uniqueProductIdentifierDocumentation,
} from '../product-passport/presentation/dto/docs/product-passport.doc';

export const createModelDocumentation = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['name'],
};

export const updateModelDocumentation = {
  ...createModelDocumentation,
  required: [],
};

export const modelDocumentation = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string' },
    productDataModelId: { type: 'string', format: 'uuid' },
    uniqueProductIdentifiers: {
      type: 'array',
      items: { ...uniqueProductIdentifierDocumentation },
    },
    dataValues: { type: 'array', items: { ...dataValueDocumentation } },
    owner: { type: 'string', format: 'uuid' },
  },
  required: ['name'],
};
