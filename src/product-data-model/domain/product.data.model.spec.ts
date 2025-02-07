import {
  DataFieldValidationResult,
  DataSection,
  ProductDataModel,
  TextField,
} from './product.data.model';
import { DataValue } from '../../products/domain/product';

describe('ProductDataModel', () => {
  it('is created from plain', () => {
    const plain = {
      name: 'Laptop',
      version: '1.0',
      sections: [
        {
          dataFields: [
            {
              type: 'TextField',
              name: 'Title',
              options: { min: 2 },
            },
            {
              type: 'TextField',
              name: 'Title 2',
              options: { min: 2 },
            },
          ],
        },
      ],
    };

    const productDataModel = ProductDataModel.fromPlain(plain);
    expect(productDataModel).toEqual(
      new ProductDataModel(expect.any(String), 'Laptop', '1.0', [
        new DataSection(expect.any(String), [
          new TextField(expect.any(String), 'Title', { min: 2 }),
          new TextField(expect.any(String), 'Title 2', { min: 2 }),
        ]),
      ]),
    );
  });

  it('should create data values', () => {
    const productDataModel = new ProductDataModel(
      'product-1',
      'Laptop',
      '1.0',
      [
        new DataSection('section-1', [
          new TextField('field-1', 'Title', { min: 2 }),
          new TextField('field-2', 'Title 2', { min: 7 }),
        ]),
        new DataSection('section-2', [
          new TextField('field-3', 'Title 3', { min: 8 }),
        ]),
      ],
    );
    const dataValues = productDataModel.createInitialDataValues();
    expect(dataValues).toEqual([
      new DataValue(expect.any(String), undefined, 'section-1', 'field-1'),
      new DataValue(expect.any(String), undefined, 'section-1', 'field-2'),
      new DataValue(expect.any(String), undefined, 'section-2', 'field-3'),
    ]);
  });

  it('should validate values successfully', () => {
    const productDataModel = new ProductDataModel(
      'product-1',
      'Laptop',
      '1.0',
      [
        new DataSection('section-1', [
          new TextField('field-1', 'Title 1', { min: 2 }),
          new TextField('field-2', 'Title 2', { min: 7 }),
        ]),
        new DataSection('section-2', [
          new TextField('field-3', 'Title 3', { min: 8 }),
        ]),
      ],
    );
    const dataValues = [
      new DataValue(undefined, 'value 1', 'section-1', 'field-1'),
      new DataValue(undefined, 'value 2', 'section-1', 'field-2'),
      new DataValue(undefined, 'value 3', 'section-2', 'field-3'),
    ];
    const validationOutput = productDataModel.validate(dataValues);

    expect(validationOutput.isValid).toBeTruthy();
    expect(validationOutput.validationResults).toEqual([
      new DataFieldValidationResult('field-1', 'Title 1', true),
      new DataFieldValidationResult('field-2', 'Title 2', true),
      new DataFieldValidationResult('field-3', 'Title 3', true),
    ]);
  });

  it('should fail validation caused by missing field and wrong type', () => {
    const productDataModel = new ProductDataModel(
      'product-1',
      'Laptop',
      '1.0',
      [
        new DataSection('section-1', [
          new TextField('field-1', 'Title 1', { min: 2 }),
          new TextField('field-2', 'Title 2', { min: 7 }),
        ]),
        new DataSection('section-2', [
          new TextField('field-3', 'Title 3', { min: 8 }),
        ]),
      ],
    );
    const dataValues = [
      new DataValue(undefined, 'value 1', 'section-1', 'field-1'),
      new DataValue(
        undefined,
        { wrongType: 'crazyMan' },
        'section-2',
        'field-3',
      ),
    ];
    const validationOutput = productDataModel.validate(dataValues);

    expect(validationOutput.isValid).toBeFalsy();
    expect(validationOutput.validationResults).toEqual([
      new DataFieldValidationResult('field-1', 'Title 1', true),
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
