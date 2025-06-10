import { ProductDataModel, VisibilityLevel } from './product.data.model';
import { SectionType } from '../../data-modelling/domain/section-base';
import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import { DataFieldValidationResult } from './data-field';
import { DataValue } from '../../passport/domain/passport';
import { ignoreIds } from '../../../test/utils';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

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
          subSections: [],
          parentId: undefined,
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
          subSections: [],
          parentId: undefined,
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
            granularityLevel: GranularityLevel.MODEL,
          },
          {
            id: 'field-2',
            type: 'TextField',
            name: 'Title 2',
            options: { min: 7 },
            granularityLevel: GranularityLevel.MODEL,
          },
          {
            id: 'field-1-item',
            type: 'TextField',
            name: 'Title Field 1 at item level',
            options: { min: 2 },
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            id: 'field-2-item',
            type: 'TextField',
            name: 'Title Field 2 at item level',
            options: { min: 7 },
            granularityLevel: GranularityLevel.ITEM,
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
            granularityLevel: GranularityLevel.MODEL,
          },
          {
            id: 'field-4',
            type: 'TextField',
            name: 'Title 4',
            options: { min: 8 },
            granularityLevel: GranularityLevel.MODEL,
          },
          {
            id: 'field-3-item',
            type: 'TextField',
            name: 'Title Field 3 at item level',
            options: { min: 8 },
            granularityLevel: GranularityLevel.ITEM,
          },
          {
            id: 'field-4-item',
            type: 'TextField',
            name: 'Title Field 4 at item level',
            options: { min: 8 },
            granularityLevel: GranularityLevel.ITEM,
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
            granularityLevel: GranularityLevel.MODEL,
          },
          {
            id: 'field-5-item',
            type: 'TextField',
            name: 'Title Field 5 at item level',
            options: { min: 8 },
            granularityLevel: GranularityLevel.ITEM,
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

  it('should create data values at model level', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    const dataValues = productDataModel.createInitialDataValues(
      GranularityLevel.MODEL,
    );
    expect(dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-1',
          value: undefined,
        }),
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-2',
          value: undefined,
        }),
        DataValue.create({
          dataSectionId: 'section-3',
          dataFieldId: 'field-5',
          value: undefined,
        }),
      ]),
    );
  });

  it('should create data values at item level', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    const dataValues = productDataModel.createInitialDataValues(
      GranularityLevel.ITEM,
    );
    expect(dataValues).toEqual(
      ignoreIds([
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-1-item',
          value: undefined,
        }),
        DataValue.create({
          dataSectionId: 'section-1',
          dataFieldId: 'field-2-item',
          value: undefined,
        }),
        DataValue.create({
          dataSectionId: 'section-3',
          dataFieldId: 'field-5-item',
          value: undefined,
        }),
      ]),
    );
  });
  //
  it('should validate values successfully', () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);

    const dataValues = [
      DataValue.create({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
      }),
      DataValue.create({
        value: 'value 2',
        dataSectionId: 'section-1',
        dataFieldId: 'field-2',
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
      }),
    ];
    const validationOutput = productDataModel.validate(
      dataValues,
      GranularityLevel.MODEL,
    );

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
      DataValue.create({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
      }),
      DataValue.create({
        value: 'value 2',
        dataSectionId: 'section-1',
        dataFieldId: 'field-2',
      }),
      DataValue.create({
        value: 'value 5',
        dataSectionId: 'section-3',
        dataFieldId: 'field-5',
      }),
    ];
    const validationOutput = productDataModel.validate(
      dataValues,
      GranularityLevel.MODEL,
    );

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
      DataValue.create({
        value: 'value 1',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
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
      }),
    ];
    const validationOutput = productDataModel.validate(
      dataValues,
      GranularityLevel.MODEL,
    );

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
});
