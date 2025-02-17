import {
  DataFieldValidationResult,
  ProductDataModel,
} from './product.data.model';
import { DataValue } from '../../models/domain/model';

describe('ProductDataModel', () => {
  it('is created from plain', () => {
    const plain = {
      name: 'Laptop',
      version: '1.0',
      sections: [
        {
          type: 'group',
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
          type: 'repeatable',
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
        dataFields: [
          {
            id: 'field-3',
            type: 'TextField',
            name: 'Title 3',
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
        dataSectionId: 'section-2',
        dataFieldId: 'field-3',
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
      }),
    ];
    const validationOutput = productDataModel.validate(dataValues);

    expect(validationOutput.isValid).toBeTruthy();
    expect(validationOutput.validationResults).toEqual([
      new DataFieldValidationResult('field-1', 'Title', true),
      new DataFieldValidationResult('field-2', 'Title 2', true),
      new DataFieldValidationResult('field-3', 'Title 3', true),
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
        value: { wrongType: 'crazyMan' },
        dataSectionId: 'section-2',
        dataFieldId: 'field-3',
      }),
    ];
    const validationOutput = productDataModel.validate(dataValues);

    expect(validationOutput.isValid).toBeFalsy();
    expect(validationOutput.validationResults).toEqual([
      new DataFieldValidationResult('field-1', 'Title', true),
      new DataFieldValidationResult(
        'field-2',
        'Title 2',
        false,
        'Value for data field is missing',
      ),
      new DataFieldValidationResult(
        'field-3',
        'Title 3',
        false,
        'Expected string, received object',
      ),
    ]);
  });
});
