export const dataValueDocumentation = {
  type: 'object',
  properties: {
    value: {
      oneOf: [
        {
          type: 'string',
          description:
            'Used for text fields, email fields, and other string-based data types',
          examples: ['Sample text', 'user@example.com'],
        },
        {
          type: 'number',
          description:
            'Used for numeric fields like quantities, measurements, or calculations',
          examples: [42, 3.14],
        },
      ],
      description: 'The value type depends on the data field type.',
    },
    dataSectionId: { type: 'string', format: 'uuid' },
    dataFieldId: { type: 'string', format: 'uuid' },
    row: { type: 'integer' },
  },
};

export const itemDocumentation = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    uniqueProductIdentifiers: {
      type: 'object',
      properties: {
        uuid: { type: 'string', format: 'uuid' },
        value: { type: 'string' },
      },
    },
    productDataModelId: { type: 'string', format: 'uuid' },
    dataValues: { type: 'array', items: { ...dataValueDocumentation } },
  },
};

export const orgaParamDocumentation = {
  name: 'orgaId',
  description: 'The id of the organization you are a member of.',
  required: true,
  type: 'string',
  format: 'uuid',
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
