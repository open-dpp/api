import {
  ProductDataModel,
  ProductDataModelDbProps,
  VisibilityLevel,
} from './product.data.model';
import { randomUUID } from 'crypto';
import { DataFieldValidationResult, TextField } from './data-field';
import { ignoreIds } from '../../../test/utils';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';
import { GroupSection, RepeaterSection } from './section';
import { Layout } from '../../data-modelling/domain/layout';

describe('ProductDataModel', () => {
  const laptopModel: ProductDataModelDbProps = {
    id: 'product-1',
    name: 'Laptop',
    createdByUserId: randomUUID(),
    ownedByOrganizationId: randomUUID(),
    visibility: VisibilityLevel.PRIVATE,
    version: '1.0',
    sections: [
      GroupSection.loadFromDb({
        id: 'section-1',
        name: 'Section 1',
        parentId: undefined,
        subSections: [],
        layout: Layout.create({
          cols: { sm: 4 },
          colSpan: { sm: 1 },
          rowSpan: { sm: 1 },
          colStart: { sm: 1 },
          rowStart: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: 'field-1',
            name: 'Title',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            options: { min: 2 },
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: 'field-2',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 2 },
              rowStart: { sm: 1 },
            }),
            name: 'Title 2',
            options: { min: 7 },
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: 'field-1-item',
            name: 'Title Field 1 at item level',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 3 },
              rowStart: { sm: 1 },
            }),
            options: { min: 2 },
            granularityLevel: GranularityLevel.ITEM,
          }),
          TextField.loadFromDb({
            id: 'field-2-item',
            name: 'Title Field 2 at item level',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 4 },
              rowStart: { sm: 1 },
            }),
            options: { min: 7 },
            granularityLevel: GranularityLevel.ITEM,
          }),
        ],
      }),
      RepeaterSection.loadFromDb({
        id: 'section-2',
        name: 'Section 2',
        parentId: undefined,
        layout: Layout.create({
          cols: { sm: 4 },
          colSpan: { sm: 1 },
          rowSpan: { sm: 1 },
          colStart: { sm: 1 },
          rowStart: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: 'field-3',
            name: 'Title 3',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            options: { min: 8 },
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: 'field-4',
            name: 'Title 4',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 2 },
              rowStart: { sm: 1 },
            }),
            options: { min: 8 },
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: 'field-3-item',
            name: 'Title Field 3 at item level',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 3 },
              rowStart: { sm: 1 },
            }),
            options: { min: 8 },
            granularityLevel: GranularityLevel.ITEM,
          }),
          TextField.loadFromDb({
            id: 'field-4-item',
            name: 'Title Field 4 at item level',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 4 },
              rowStart: { sm: 1 },
            }),
            options: { min: 8 },
            granularityLevel: GranularityLevel.ITEM,
          }),
        ],
        subSections: ['section-4'],
        granularityLevel: GranularityLevel.MODEL,
      }),
      GroupSection.loadFromDb({
        id: 'section-3',
        name: 'Section 3',
        parentId: undefined,
        subSections: [],
        layout: Layout.create({
          cols: { sm: 2 },
          colSpan: { sm: 1 },
          rowSpan: { sm: 1 },
          colStart: { sm: 1 },
          rowStart: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: 'field-5',
            name: 'Title 5',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            options: { min: 8 },
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.loadFromDb({
            id: 'field-5-item',
            name: 'Title Field 5 at item level',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 2 },
              rowStart: { sm: 1 },
            }),
            options: { min: 8 },
            granularityLevel: GranularityLevel.ITEM,
          }),
        ],
      }),
      GroupSection.loadFromDb({
        parentId: 'section-2',
        id: 'section-4',
        name: 'Section 4',
        subSections: [],
        layout: Layout.create({
          cols: { sm: 2 },
          colSpan: { sm: 1 },
          rowSpan: { sm: 1 },
          colStart: { sm: 1 },
          rowStart: { sm: 1 },
        }),
        dataFields: [
          TextField.loadFromDb({
            id: 'field-6',
            name: 'Title 6',
            layout: Layout.create({
              colSpan: { sm: 1 },
              rowSpan: { sm: 1 },
              colStart: { sm: 1 },
              rowStart: { sm: 1 },
            }),
            options: { min: 8 },
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
      }),
    ],
  };

  it('is published', () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const otherOrganizationId = randomUUID();
    const dataModel = ProductDataModel.create({
      name: 'laptop',
      userId,
      organizationId,
      visibility: VisibilityLevel.PRIVATE,
    });
    expect(dataModel.isOwnedBy(organizationId)).toBeTruthy();
    expect(dataModel.isOwnedBy(otherOrganizationId)).toBeFalsy();
    dataModel.publish();
    expect(dataModel.isOwnedBy(organizationId)).toBeTruthy();
    expect(dataModel.isPublic()).toBeTruthy();
    expect(dataModel.visibility).toEqual(VisibilityLevel.PUBLIC);
  });

  it('should create data values at model level', () => {
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    const dataValues = productDataModel.createInitialDataValues(
      GranularityLevel.MODEL,
    );
    expect(dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-1',
          value: undefined,
          row: 0,
        }),
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-2',
          value: undefined,
          row: 0,
        }),
        DataValue.create({
          dataSectionId: 'section-3',
          dataFieldId: 'field-5',
          value: undefined,
          row: 0,
        }),
      ]),
    );
  });

  it('should create data values at item level', () => {
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    const dataValues = productDataModel.createInitialDataValues(
      GranularityLevel.ITEM,
    );
    expect(dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-1-item',
          value: undefined,
          row: 0,
        }),
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-2-item',
          value: undefined,
          row: 0,
        }),
        DataValue.create({
          dataSectionId: 'section-3',
          dataFieldId: 'field-5-item',
          value: undefined,
          row: 0,
        }),
      ]),
    );
  });
  //
  it('should validate values successfully', () => {
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);

    const dataValues = [
      DataValue.create({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
        row: 0,
      }),
      DataValue.create({
        value: 'value 2',
        dataSectionId: 'section-1',
        dataFieldId: 'field-2',
        row: 0,
      }),
      DataValue.create({
        value: 'value 3',
        dataSectionId: 'section-2',
        dataFieldId: 'field-3',
        row: 0,
      }),
      DataValue.create({
        value: 'value 4',
        dataSectionId: 'section-2',
        dataFieldId: 'field-4',
        row: 0,
      }),
      DataValue.create({
        value: 'value 5',
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
        row: 0,
      }),
      DataValue.create({
        value: 'value 6',
        dataSectionId: 'section-4',
        dataFieldId: 'field-6',
        row: 0,
      }),
    ];
    const validationOutput = productDataModel.validate(
      dataValues,
      GranularityLevel.MODEL,
    );

    expect(validationOutput.isValid).toBeTruthy();
    expect(validationOutput.validationResults).toEqual([
      DataFieldValidationResult.create({
        dataFieldId: 'field-1',
        dataFieldName: 'Title',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-2',
        dataFieldName: 'Title 2',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-3',
        dataFieldName: 'Title 3',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-4',
        dataFieldName: 'Title 4',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-5',
        dataFieldName: 'Title 5',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-6',
        dataFieldName: 'Title 6',
        isValid: true,
      }),
    ]);
  });

  it('should validate values successfully if there are no data values for repeatable section', () => {
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);

    const dataValues = [
      DataValue.create({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
        row: 0,
      }),
      DataValue.create({
        value: 'value 2',
        dataSectionId: 'section-1',
        dataFieldId: 'field-2',
        row: 0,
      }),
      DataValue.create({
        value: 'value 5',
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
        row: 0,
      }),
      DataValue.create({
        value: 'value 6',
        dataSectionId: 'section-4',
        dataFieldId: 'field-6',
        row: 0,
      }),
    ];
    const validationOutput = productDataModel.validate(
      dataValues,
      GranularityLevel.MODEL,
    );

    expect(validationOutput.isValid).toBeTruthy();
    expect(validationOutput.validationResults).toEqual([
      DataFieldValidationResult.create({
        dataFieldId: 'field-1',
        dataFieldName: 'Title',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-2',
        dataFieldName: 'Title 2',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-5',
        dataFieldName: 'Title 5',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-6',
        dataFieldName: 'Title 6',
        isValid: true,
      }),
    ]);
  });

  it('should fail validation caused by missing field and wrong type', () => {
    const productDataModel = ProductDataModel.loadFromDb(laptopModel);
    const dataValues = [
      DataValue.create({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
        row: 0,
      }),
      DataValue.create({
        value: 'value 4',
        dataSectionId: 'section-2',
        dataFieldId: 'field-4',
        row: 0,
      }),
      DataValue.create({
        value: { wrongType: 'crazyMan' },
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
        row: 0,
      }),
      DataValue.create({
        value: 'value 6',
        dataSectionId: 'section-4',
        dataFieldId: 'field-6',
        row: 0,
      }),
    ];
    const validationOutput = productDataModel.validate(
      dataValues,
      GranularityLevel.MODEL,
    );

    expect(validationOutput.isValid).toBeFalsy();
    expect(validationOutput.validationResults).toEqual([
      DataFieldValidationResult.create({
        dataFieldId: 'field-1',
        dataFieldName: 'Title',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-2',
        dataFieldName: 'Title 2',
        isValid: false,
        errorMessage: 'Value for data field is missing',
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-3',
        dataFieldName: 'Title 3',
        isValid: false,
        row: 0,
        errorMessage: 'Value for data field is missing',
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-4',
        dataFieldName: 'Title 4',
        isValid: true,
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-5',
        dataFieldName: 'Title 5',
        isValid: false,
        errorMessage: 'Invalid input: expected string, received object',
      }),
      DataFieldValidationResult.create({
        dataFieldId: 'field-6',
        dataFieldName: 'Title 6',
        isValid: true,
      }),
    ]);
  });
});
