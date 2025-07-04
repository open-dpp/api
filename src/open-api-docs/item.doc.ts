import {
  dataValueDocumentation,
  uniqueProductIdentifierDocumentation,
} from '../product-passport/presentation/dto/docs/product-passport.doc';

export const itemDocumentation = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    uniqueProductIdentifiers: {
      type: 'array',
      items: { ...uniqueProductIdentifierDocumentation },
    },
    productDataModelId: { type: 'string', format: 'uuid' },
    dataValues: { type: 'array', items: { ...dataValueDocumentation } },
  },
};

export const modelParamDocumentation = {
  name: 'modelId',
  description: 'The id of the model. A item always belongs to a model.',
  required: true,
  type: 'string',
  format: 'uuid',
};

export const itemParamDocumentation = {
  name: 'itemId',
  description: 'The id of the item.',
  required: true,
  type: 'string',
  format: 'uuid',
};
