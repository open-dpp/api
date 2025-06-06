import { Model } from './model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Organization } from '../../organizations/domain/organization';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { DataValue } from '../../passport/passport';

describe('Model', () => {
  const user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({ name: 'My orga', user });
  it('should create unique product identifiers on model creation', () => {
    const model = Model.create({ name: 'My model', user, organization });
    const uniqueModelIdentifier1 = model.createUniqueProductIdentifier();
    const uniqueModelIdentifier2 = model.createUniqueProductIdentifier();

    expect(model.id).toBeDefined();
    expect(model.uniqueProductIdentifiers).toEqual([
      uniqueModelIdentifier1,
      uniqueModelIdentifier2,
    ]);
    expect(uniqueModelIdentifier1.referenceId).toEqual(model.id);
    expect(uniqueModelIdentifier2.referenceId).toEqual(model.id);
  });

  it('should create new model', () => {
    const model = Model.create({ name: 'My model', user, organization });

    expect(model.isOwnedBy(organization)).toBeTruthy();
    expect(
      model.isOwnedBy(Organization.create({ name: 'My orga', user })),
    ).toBeFalsy();
  });

  it('is created from plain with defaults', () => {
    const model = Model.create({
      name: 'My name',
      user,
      organization,
      description: 'my description',
    });
    expect(model.id).toEqual(expect.any(String));
    expect(model.name).toEqual('My name');
    expect(model.description).toEqual('my description');
    expect(model.uniqueProductIdentifiers).toEqual([]);
    expect(model.productDataModelId).toBeUndefined();
    expect(model.dataValues).toEqual([]);
  });

  it('is created from persistence', () => {
    const id = randomUUID();
    const name = 'My name';
    const description = 'Some description';
    const productDataModelId = randomUUID();
    const dataValues = [
      {
        id: 'someId 1',
        value: 'value1',
        dataSectionId: 'sectionId 1',
        dataFieldId: 'dataField 1',
      },
      {
        id: 'someId 2',
        value: 'value2',
        dataSectionId: 'sectionId 2',
        dataFieldId: 'dataField 2',
      },
    ];

    const createdByUserId = randomUUID();
    const ownedByOrganizationId = randomUUID();

    const model = Model.loadFromDb({
      id,
      name,
      ownedByOrganizationId,
      createdByUserId,
      uniqueProductIdentifiers: [],
      productDataModelId,
      dataValues,
      description,
      createdAt: undefined,
    });
    expect(model.id).toEqual(id);
    expect(model.name).toEqual(name);
    expect(model.description).toEqual(description);
    expect(
      model.isOwnedBy(Organization.fromPlain({ id: ownedByOrganizationId })),
    ).toBeTruthy();
    expect(model.dataValues).toEqual(dataValues);
    expect(model.productDataModelId).toEqual(productDataModelId);
  });

  it('add data values', () => {
    const model = Model.create({ name: 'My name', user, organization });
    model.addDataValues([
      DataValue.fromPlain({
        dataFieldId: 'fieldId2',
        dataSectionId: 'sid2',
        value: 'value 2',
        row: 0,
      }),
      DataValue.fromPlain({
        dataFieldId: 'fieldId3',
        dataSectionId: 'sid2',
        value: 'value 3',
        row: 0,
      }),
      DataValue.fromPlain({
        dataFieldId: 'fieldId2',
        dataSectionId: 'sid2',
        value: 'value 4',
        row: 1,
      }),
      DataValue.fromPlain({
        dataFieldId: 'fieldId3',
        dataSectionId: 'sid2',
        value: 'value 5',
        row: 1,
      }),
    ]);
    expect(model.dataValues).toEqual([
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: 'sid2',
        dataFieldId: 'fieldId2',
        value: 'value 2',
        row: 0,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: 'sid2',
        dataFieldId: 'fieldId3',
        value: 'value 3',
        row: 0,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: 'sid2',
        dataFieldId: 'fieldId2',
        value: 'value 4',
        row: 1,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: 'sid2',
        dataFieldId: 'fieldId3',
        value: 'value 5',
        row: 1,
      }),
    ]);
  });

  it('add data values fails if data values already exist', () => {
    const dataValues = [
      DataValue.fromPlain({
        id: 'd1',
        value: undefined,
        dataSectionId: 'sid1',
        dataFieldId: 'fieldId1',
        row: 0,
      }),
    ];
    const model = Model.create({
      name: 'my name',
      organization,
      user,
    });
    model.addDataValues(dataValues);

    expect(() =>
      model.addDataValues([
        DataValue.fromPlain({
          dataFieldId: 'fieldId2',
          dataSectionId: 'sid1',
          value: 'value 2',
          row: 0,
        }),
        DataValue.fromPlain({
          dataFieldId: 'fieldId1',
          dataSectionId: 'sid1',
          value: 'value 1',
          row: 0,
        }),
      ]),
    ).toThrowError(
      'Data value for section sid1, field fieldId1, row 0 already exists',
    );
  });

  it('is renamed', () => {
    const user = new User(randomUUID(), 'test@example.com');
    const organization = Organization.create({ name: 'orga', user });
    const model = Model.create({ name: 'My Name', user, organization });
    model.rename('new Name');
    model.modifyDescription('new description');
    expect(model.name).toEqual('new Name');
    expect(model.description).toEqual('new description');
  });

  it('modifies data values', () => {
    const dataValues = [
      DataValue.fromPlain({
        id: 'd1',
        value: undefined,
        dataSectionId: 's1',
        dataFieldId: 'f1',
      }),
      DataValue.fromPlain({
        id: 'd2',
        value: 'v2',
        dataSectionId: 's1',
        dataFieldId: 'f2',
      }),
      DataValue.fromPlain({
        id: 'd3',
        value: 'v3',
        dataSectionId: 's2',
        dataFieldId: 'f3',
      }),
    ];
    const model = Model.create({
      name: 'my name',
      organization,
      user,
    });
    model.addDataValues(dataValues);
    const dataValueUpdates = [
      { id: 'd1', value: 'v1' },
      { id: 'd3', value: 'v3 new' },
    ];
    model.modifyDataValues(dataValueUpdates);
    expect(model.dataValues).toEqual([
      { id: 'd1', value: 'v1', dataSectionId: 's1', dataFieldId: 'f1' },
      { id: 'd2', value: 'v2', dataSectionId: 's1', dataFieldId: 'f2' },
      { id: 'd3', value: 'v3 new', dataSectionId: 's2', dataFieldId: 'f3' },
    ]);
  });

  describe('DataValue', () => {
    it('should create a data value with default values', () => {
      const dataValue = new DataValue();

      expect(dataValue.id).toBeDefined();
      expect(dataValue.value).toBeUndefined();
      expect(dataValue.dataSectionId).toBeUndefined();
      expect(dataValue.dataFieldId).toBeUndefined();
      expect(dataValue.row).toBeUndefined();
    });

    it('should create from plain object', () => {
      const plain = {
        value: 'test-value',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
        row: 3,
      };

      const dataValue = DataValue.fromPlain(plain);

      expect(dataValue.id).toBeDefined();
      expect(dataValue.value).toBe('test-value');
      expect(dataValue.dataSectionId).toBe('section-1');
      expect(dataValue.dataFieldId).toBe('field-1');
      expect(dataValue.row).toBe(3);
    });

    it('should ignore extra properties when creating from plain', () => {
      const plain = {
        value: 'test-value',
        dataSectionId: 'section-1',
        dataFieldId: 'field-1',
        extraProperty: 'should be ignored',
      };

      const dataValue = DataValue.fromPlain(plain as any);

      expect(dataValue.value).toBe('test-value');
      expect((dataValue as any).extraProperty).toBeUndefined();
    });
  });

  describe('assignProductDataModel', () => {
    it('should assign product data model and initialize data values', () => {
      const model = Model.create({ name: 'Test Model', user, organization });

      // Create a mock product data model
      const productDataModel = {
        id: 'pdm-1',
        createInitialDataValues: jest.fn().mockReturnValue([
          DataValue.fromPlain({
            dataSectionId: 'section-1',
            dataFieldId: 'field-1',
          }),
          DataValue.fromPlain({
            dataSectionId: 'section-1',
            dataFieldId: 'field-2',
          }),
        ]),
      } as unknown as ProductDataModel;

      // Assign the product data model
      model.assignProductDataModel(productDataModel);

      expect(model.productDataModelId).toBe('pdm-1');
      expect(model.dataValues).toHaveLength(2);
      expect(productDataModel.createInitialDataValues).toHaveBeenCalled();
    });

    it('should throw error if model already has a product data model', () => {
      const model = Model.create({ name: 'Test Model', user, organization });

      const productDataModel1 = ProductDataModel.create({
        name: 'existing-pdm',
        user,
        organization,
      });

      model.assignProductDataModel(productDataModel1);

      const productDataModel2 = ProductDataModel.create({
        name: 'other-pdm',
        user,
        organization,
      });

      // Try to assign a second product data model
      expect(() => model.assignProductDataModel(productDataModel2)).toThrow(
        'This model is already connected to a product data model',
      );
    });
  });
});
