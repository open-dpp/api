const responsiveConfigDocumentation = {
  type: 'object',
  properties: {
    xs: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      nullable: true,
    },
    sm: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
    },
    md: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      nullable: true,
    },
    lg: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      nullable: true,
    },
    xl: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      nullable: true,
    },
  },
  required: ['sm'],
};

export const layoutDocumentation = {
  type: 'object',
  properties: {
    colStart: { ...responsiveConfigDocumentation },
    colSpan: { ...responsiveConfigDocumentation },
    rowStart: { ...responsiveConfigDocumentation },
    rowSpan: { ...responsiveConfigDocumentation },
  },
  required: ['colStart', 'colSpan', 'rowStart', 'rowSpan'],
};
