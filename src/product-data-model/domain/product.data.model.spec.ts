import {
  DataFieldValidationResult,
  ProductDataModel,
  SectionType,
  DataType,
  TextField,
  GroupSection,
  RepeaterSection,
  ValidationResult,
} from './product.data.model';
import { DataValue } from '../../models/domain/model';
import { plainToInstance } from 'class-transformer';

describe('ValidationResult', () => {
  it('should be valid by default', () => {
    const validationResult = new ValidationResult();
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.validationResults).toEqual([]);
  });

  it('should add validation results and track validity', () => {
    const validationResult = new ValidationResult();
    const validField = DataFieldValidationResult.fromPlain({
      dataFieldId: '123',
      dataFieldName: 'Valid Field',
      isValid: true,
    });

    validationResult.addValidationResult(validField);
    expect(validationResult.isValid).toBe(true);

    const invalidField = DataFieldValidationResult.fromPlain({
      dataFieldId: '456',
      dataFieldName: 'Invalid Field',
      isValid: false,
      errorMessage: 'Error message',
    });

    validationResult.addValidationResult(invalidField);
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.validationResults).toHaveLength(2);
  });

  it('should convert to JSON with only errors', () => {
    const validationResult = new ValidationResult();

    validationResult.addValidationResult(
      DataFieldValidationResult.fromPlain({
        dataFieldId: '123',
        dataFieldName: 'Valid Field',
        isValid: true,
      }),
    );

    validationResult.addValidationResult(
      DataFieldValidationResult.fromPlain({
        dataFieldId: '456',
        dataFieldName: 'Invalid Field',
        isValid: false,
        errorMessage: 'Error message',
      }),
    );

    const json = validationResult.toJson();

    expect(json.isValid).toBe(false);
    expect(json.errors).toHaveLength(1);
    expect(json.errors[0]).toEqual({
      id: '456',
      name: 'Invalid Field',
      message: 'Error message',
    });
  });
});

describe('DataFieldValidationResult', () => {
  it('should create from plain object', () => {
    const plain = {
      dataFieldId: '123',
      dataFieldName: 'Test Field',
      isValid: true,
      row: 5,
      errorMessage: 'Test error',
    };

    const result = DataFieldValidationResult.fromPlain(plain);

    expect(result.dataFieldId).toBe('123');
    expect(result.dataFieldName).toBe('Test Field');
    expect(result.isValid).toBe(true);
    expect(result.row).toBe(5);
    expect(result.errorMessage).toBe('Test error');
  });

  it('should include row in JSON output only if present', () => {
    const withRow = DataFieldValidationResult.fromPlain({
      dataFieldId: '123',
      dataFieldName: 'Test Field',
      isValid: false,
      row: 5,
      errorMessage: 'Test error',
    });

    const withoutRow = DataFieldValidationResult.fromPlain({
      dataFieldId: '456',
      dataFieldName: 'Another Field',
      isValid: false,
      errorMessage: 'Another error',
    });

    expect(withRow.toJson()).toEqual({
      id: '123',
      name: 'Test Field',
      row: 5,
      message: 'Test error',
    });

    expect(withoutRow.toJson()).toEqual({
      id: '456',
      name: 'Another Field',
      message: 'Another error',
    });
  });
});

describe('TextField', () => {
  it('should have proper data field type', () => {
    // Using a UUID in the test to ensure the ID is defined
    const textFieldId = 'test-id-123';
    const textField = plainToInstance(TextField, {
      id: textFieldId,
      name: 'Test Field',
      type: DataType.TEXT_FIELD,
      options: {},
    });

    expect(textField.type).toBe(DataType.TEXT_FIELD);
    expect(textField.id).toBe(textFieldId);
    expect(textField.options).toEqual({});
  });

  it('should validate string values', () => {
    const textField = plainToInstance(TextField, {
      id: '123',
      name: 'Test Field',
      type: DataType.TEXT_FIELD,
    });

    const result = textField.validate('1.0.0', 'Valid text');

    expect(result.isValid).toBe(true);
    expect(result.dataFieldId).toBe('123');
    expect(result.dataFieldName).toBe('Test Field');
  });

  it('should return validation errors for invalid values', () => {
    const textField = plainToInstance(TextField, {
      id: '123',
      name: 'Test Field',
      type: DataType.TEXT_FIELD,
    });

    const result = textField.validate('1.0.0', null);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });
});

describe('DataSection implementations', () => {
  describe('GroupSection', () => {
    it('should validate fields within the section', () => {
      const groupSection = plainToInstance(GroupSection, {
        id: 'section-a',
        name: 'Group Section',
        type: SectionType.GROUP,
        dataFields: [
          {
            id: 'field-x',
            name: 'Field X',
            type: DataType.TEXT_FIELD,
          },
        ],
      });

      const dataValues = [
        DataValue.fromPlain({
          dataSectionId: 'section-a',
          dataFieldId: 'field-x',
          value: 'Value X',
        }),
      ];

      const results = groupSection.validate('1.0.0', dataValues);

      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(true);
      expect(results[0].dataFieldId).toBe('field-x');
    });

    it('should report missing field values', () => {
      const groupSection = plainToInstance(GroupSection, {
        id: 'section-a',
        name: 'Group Section',
        type: SectionType.GROUP,
        dataFields: [
          {
            id: 'field-x',
            name: 'Field X',
            type: DataType.TEXT_FIELD,
          },
        ],
      });

      // Empty data values
      const results = groupSection.validate('1.0.0', []);

      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errorMessage).toBe('Value for data field is missing');
    });
  });

  describe('RepeaterSection', () => {
    it('should validate fields within each row', () => {
      const repeaterSection = plainToInstance(RepeaterSection, {
        id: 'section-b',
        name: 'Repeater Section',
        type: SectionType.REPEATABLE,
        dataFields: [
          {
            id: 'field-y',
            name: 'Field Y',
            type: DataType.TEXT_FIELD,
          },
        ],
      });

      const dataValues = [
        DataValue.fromPlain({
          dataSectionId: 'section-b',
          dataFieldId: 'field-y',
          value: 'Row 0 Value',
          row: 0,
        }),
        DataValue.fromPlain({
          dataSectionId: 'section-b',
          dataFieldId: 'field-y',
          value: 'Row 1 Value',
          row: 1,
        }),
      ];

      const results = repeaterSection.validate('1.0.0', dataValues);

      expect(results).toHaveLength(2); // One result per row
      expect(results[0].isValid).toBe(true);
      // The row information is handled in the data value, not necessarily passed to the validation result
      // Instead, check that the results match the expected fields
      expect(
        results.some((r) => r.dataFieldId === 'field-y' && r.isValid),
      ).toBe(true);
    });

    it('should validate multiple fields in the same row', () => {
      const repeaterSection = plainToInstance(RepeaterSection, {
        id: 'section-b',
        name: 'Repeater Section',
        type: SectionType.REPEATABLE,
        dataFields: [
          {
            id: 'field-y1',
            name: 'Field Y1',
            type: DataType.TEXT_FIELD,
          },
          {
            id: 'field-y2',
            name: 'Field Y2',
            type: DataType.TEXT_FIELD,
          },
        ],
      });

      const dataValues = [
        DataValue.fromPlain({
          dataSectionId: 'section-b',
          dataFieldId: 'field-y1',
          value: 'Y1 Value',
          row: 0,
        }),
        DataValue.fromPlain({
          dataSectionId: 'section-b',
          dataFieldId: 'field-y2',
          value: null, // Invalid value
          row: 0,
        }),
      ];

      const results = repeaterSection.validate('1.0.0', dataValues);

      expect(results).toHaveLength(2);
      // Find the valid and invalid results
      const validResult = results.find((r) => r.isValid);
      const invalidResult = results.find((r) => !r.isValid);

      expect(validResult).toBeDefined();
      expect(invalidResult).toBeDefined();
      expect(validResult.dataFieldId).toBe('field-y1');
      expect(invalidResult.dataFieldId).toBe('field-y2');
    });

    it('should handle missing values in repeater section rows', () => {
      const repeaterSection = plainToInstance(RepeaterSection, {
        id: 'section-b',
        name: 'Repeater Section',
        type: SectionType.REPEATABLE,
        dataFields: [
          {
            id: 'field-y1',
            name: 'Field Y1',
            type: DataType.TEXT_FIELD,
          },
          {
            id: 'field-y2',
            name: 'Field Y2',
            type: DataType.TEXT_FIELD,
          },
        ],
      });

      const dataValues = [
        DataValue.fromPlain({
          dataSectionId: 'section-b',
          dataFieldId: 'field-y1',
          value: 'Y1 Value',
          row: 0,
        }),
        // Missing field-y2 for row 0
      ];

      const results = repeaterSection.validate('1.0.0', dataValues);

      expect(results).toHaveLength(2);
      const missingFieldResult = results.find(
        (r) => !r.isValid && r.dataFieldId === 'field-y2',
      );

      expect(missingFieldResult).toBeDefined();
      expect(missingFieldResult.errorMessage).toContain('missing');
    });
  });
});

describe('ProductDataModel', () => {
  it('is created from plain', () => {
    const plain = {
      name: 'Laptop',
      version: '1.0',
      sections: [
        {
          type: SectionType.GROUP,
          name: 'Umwelt',
          dataFields: [
            {
              type: 'TextField',
              name: 'Title',
              options: { max: 2 },
            },
            {
              type: 'TextField',
              name: 'Title 2',
              options: { min: 2 },
            },
          ],
        },
        {
          name: 'Material',
          type: SectionType.REPEATABLE,
          dataFields: [
            {
              type: 'TextField',
              name: 'rep field 1',
              options: {},
            },
            {
              type: 'TextField',
              name: 'rep field 2',
              options: {},
            },
          ],
        },
      ],
    };

    const productDataModel = ProductDataModel.fromPlain(plain);
    expect(productDataModel.version).toEqual(plain.version);
    expect(productDataModel.name).toEqual(plain.name);
    expect(productDataModel.sections).toHaveLength(2);
    for (const [index, section] of plain.sections.entries()) {
      const currentSection = productDataModel.sections[index];
      expect(currentSection.dataFields).toHaveLength(section.dataFields.length);
      expect(currentSection.type).toEqual(section.type);
      expect(currentSection.name).toEqual(section.name);

      for (const [dataFieldIndex, dataField] of section.dataFields.entries()) {
        const currentField = currentSection.dataFields[dataFieldIndex];
        expect(currentField.type).toEqual(dataField.type);
        expect(currentField.name).toEqual(dataField.name);
        expect(currentField.options).toEqual(dataField.options);
      }
    }

    expect(productDataModel.toPlain()).toEqual({
      ...plain,
      id: expect.any(String),
      sections: plain.sections.map((s) => ({
        id: expect.any(String),
        ...s,
        dataFields: s.dataFields.map((f) => ({ id: expect.any(String), ...f })),
      })),
    });
  });

  const laptopModel = {
    id: 'product-1',
    name: 'Laptop',
    version: '1.0',
    sections: [
      {
        id: 'section-1',
        name: 'Section 1',
        type: SectionType.GROUP,
        dataFields: [
          {
            id: 'field-1',
            type: 'TextField',
            name: 'Title',
            options: { min: 2 },
          },
          {
            id: 'field-2',
            type: 'TextField',
            name: 'Title 2',
            options: { min: 7 },
          },
        ],
      },
      {
        id: 'section-2',
        name: 'Section 2',
        type: SectionType.REPEATABLE,
        dataFields: [
          {
            id: 'field-3',
            type: 'TextField',
            name: 'Title 3',
            options: { min: 8 },
          },
          {
            id: 'field-4',
            type: 'TextField',
            name: 'Title 4',
            options: { min: 8 },
          },
        ],
      },
      {
        id: 'section-3',
        name: 'Section 3',
        type: SectionType.GROUP,
        dataFields: [
          {
            id: 'field-5',
            type: 'TextField',
            name: 'Title 5',
            options: { min: 8 },
          },
        ],
      },
    ],
  };

  it('should create data values', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    const dataValues = productDataModel.createInitialDataValues();
    expect(dataValues).toEqual([
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: 'section-1',
        dataFieldId: 'field-2',
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
      }),
    ]);
  });
  //
  it('should validate values successfully', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);

    const dataValues = [
      DataValue.fromPlain({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
      }),
      DataValue.fromPlain({
        value: 'value 2',
        dataSectionId: 'section-1',
        dataFieldId: 'field-2',
      }),
      DataValue.fromPlain({
        value: 'value 3',
        dataSectionId: 'section-2',
        dataFieldId: 'field-3',
        row: 0,
      }),
      DataValue.fromPlain({
        value: 'value 4',
        dataSectionId: 'section-2',
        dataFieldId: 'field-4',
        row: 0,
      }),
      DataValue.fromPlain({
        value: 'value 5',
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
      }),
    ];
    const validationOutput = productDataModel.validate(dataValues);

    expect(validationOutput.isValid).toBeTruthy();
    expect(validationOutput.validationResults).toEqual([
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-1',
        dataFieldName: 'Title',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-2',
        dataFieldName: 'Title 2',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-3',
        dataFieldName: 'Title 3',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-4',
        dataFieldName: 'Title 4',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-5',
        dataFieldName: 'Title 5',
        isValid: true,
      }),
    ]);
  });

  it('should validate values successfully if there are no data values for repeatable section', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);

    const dataValues = [
      DataValue.fromPlain({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
      }),
      DataValue.fromPlain({
        value: 'value 2',
        dataSectionId: 'section-1',
        dataFieldId: 'field-2',
      }),
      DataValue.fromPlain({
        value: 'value 5',
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
      }),
    ];
    const validationOutput = productDataModel.validate(dataValues);

    expect(validationOutput.isValid).toBeTruthy();
    expect(validationOutput.validationResults).toEqual([
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-1',
        dataFieldName: 'Title',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-2',
        dataFieldName: 'Title 2',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-5',
        dataFieldName: 'Title 5',
        isValid: true,
      }),
    ]);
  });
  //
  it('should fail validation caused by missing field and wrong type', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    const dataValues = [
      DataValue.fromPlain({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
      }),
      DataValue.fromPlain({
        value: 'value 4',
        dataSectionId: 'section-2',
        dataFieldId: 'field-4',
        row: 0,
      }),
      DataValue.fromPlain({
        value: { wrongType: 'crazyMan' },
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
      }),
    ];
    const validationOutput = productDataModel.validate(dataValues);

    expect(validationOutput.isValid).toBeFalsy();
    expect(validationOutput.validationResults).toEqual([
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-1',
        dataFieldName: 'Title',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-2',
        dataFieldName: 'Title 2',
        isValid: false,
        errorMessage: 'Value for data field is missing',
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-3',
        dataFieldName: 'Title 3',
        isValid: false,
        row: 0,
        errorMessage: 'Value for data field is missing',
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-4',
        dataFieldName: 'Title 4',
        isValid: true,
      }),
      DataFieldValidationResult.fromPlain({
        dataFieldId: 'field-5',
        dataFieldName: 'Title 5',
        isValid: false,
        errorMessage: 'Expected string, received object',
      }),
    ]);
  });

  it('should validate only specified sections', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    const dataValues = [
      // Missing values for section-1
      DataValue.fromPlain({
        value: 'value 3',
        dataSectionId: 'section-2',
        dataFieldId: 'field-3',
        row: 0,
      }),
      DataValue.fromPlain({
        value: 'value 4',
        dataSectionId: 'section-2',
        dataFieldId: 'field-4',
        row: 0,
      }),
      // Missing values for section-3
    ];

    // Only validate section-2
    const validationOutput = productDataModel.validate(dataValues, [
      'section-2',
    ]);

    expect(validationOutput.isValid).toBe(true);
    expect(validationOutput.validationResults).toHaveLength(2);
    expect(validationOutput.validationResults[0].dataFieldId).toBe('field-3');
    expect(validationOutput.validationResults[1].dataFieldId).toBe('field-4');
  });

  it('should handle multiple product data model instances correctly', () => {
    // Create two separate product data models
    const model1 = ProductDataModel.fromPlain({
      id: 'model-1',
      name: 'Model 1',
      version: '1.0.0',
      sections: [
        {
          id: 'section-a',
          name: 'Section A',
          type: SectionType.GROUP,
          dataFields: [
            {
              id: 'field-a',
              name: 'Field A',
              type: DataType.TEXT_FIELD,
            },
          ],
        },
      ],
    });

    const model2 = ProductDataModel.fromPlain({
      id: 'model-2',
      name: 'Model 2',
      version: '1.0.0',
      sections: [
        {
          id: 'section-b',
          name: 'Section B',
          type: SectionType.GROUP,
          dataFields: [
            {
              id: 'field-b',
              name: 'Field B',
              type: DataType.TEXT_FIELD,
            },
          ],
        },
      ],
    });

    // Ensure each model has different sections and IDs
    expect(model1.id).not.toBe(model2.id);
    expect(model1.sections[0].id).not.toBe(model2.sections[0].id);
    expect(model1.sections[0].dataFields[0].id).not.toBe(
      model2.sections[0].dataFields[0].id,
    );

    // Test that validation works correctly for each model
    const values1 = [
      DataValue.fromPlain({
        dataSectionId: model1.sections[0].id,
        dataFieldId: model1.sections[0].dataFields[0].id,
        value: 'Value for Model 1',
      }),
    ];

    const values2 = [
      DataValue.fromPlain({
        dataSectionId: model2.sections[0].id,
        dataFieldId: model2.sections[0].dataFields[0].id,
        value: 'Value for Model 2',
      }),
    ];

    const result1 = model1.validate(values1);
    const result2 = model2.validate(values2);

    expect(result1.isValid).toBe(true);
    expect(result2.isValid).toBe(true);
  });
});
