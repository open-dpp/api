import { ProductDataModel, VisibilityLevel } from './product.data.model';
import { DataValue } from '../../models/domain/model';
import { DataFieldValidationResult } from './data.field';
import { SectionType } from './section';
import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';

describe('ProductDataModel', () => {
  it('is created from plain', () => {
    const plain = {
      name: 'Laptop',
      version: '1.0',
      ownedByOrganizationId: randomUUID(),
      createdByUserId: randomUUID(),
      visibility: VisibilityLevel.PUBLIC,
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

  it('is published', () => {
    const user = new User(randomUUID(), 'test@example.com');
    const organization = Organization.create({ name: 'Orga', user });
    const otherOrganization = Organization.create({ name: 'Orga', user });
    const dataModel = ProductDataModel.create({
      name: 'laptop',
      user,
      organization,
      visibility: VisibilityLevel.PRIVATE,
    });
    expect(dataModel.isOwnedBy(organization)).toBeTruthy();
    expect(dataModel.isOwnedBy(otherOrganization)).toBeFalsy();
    dataModel.publish();
    expect(dataModel.isOwnedBy(organization)).toBeTruthy();
    expect(dataModel.isPublic()).toBeTruthy();
    expect(dataModel.visibility).toEqual(VisibilityLevel.PUBLIC);
  });

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
