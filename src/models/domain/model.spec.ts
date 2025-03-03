import { DataValue, Model } from './model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Organization } from '../../organizations/domain/organization';

describe('Model', () => {
  it('should create unique product identifiers on model creation', () => {
    const model = Model.fromPlain({
      name: 'My model',
      description: 'This is my model',
    });
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
    const user = new User(randomUUID(), 'test@example.com');
    const organization = Organization.create({ name: 'My orga', user });
    const model = Model.create({ name: 'My model', user, organization });

    expect(model.isOwnedBy(organization)).toBeTruthy();
    expect(
      model.isOwnedBy(Organization.create({ name: 'My orga', user })),
    ).toBeFalsy();
  });

  it('is created from plain with defaults', () => {
    const plain = {
      name: 'My name',
      description: 'Some description',
    };
    const model = Model.fromPlain(plain);
    expect(model.id).toEqual(expect.any(String));
    expect(model.name).toEqual(plain.name);
    expect(model.description).toEqual(plain.description);
    expect(model.uniqueProductIdentifiers).toEqual([]);
    expect(model.productDataModelId).toBeUndefined();
    expect(model.dataValues).toEqual([]);
    expect(model.createdAt).toBeUndefined();
  });

  it('is created from plain', () => {
    const plain = {
      id: randomUUID(),
      name: 'My name',
      description: 'Some description',
      productDataModelId: randomUUID(),
      dataValues: [
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
      ],
      createdByUserId: randomUUID(),
      ownedByOrganizationId: randomUUID(),
    };
    const model = Model.fromPlain(plain);
    expect(model.id).toEqual(plain.id);
    expect(model.name).toEqual(plain.name);
    expect(model.description).toEqual(plain.description);
    expect(
      model.isOwnedBy(
        Organization.fromPlain({ id: plain.ownedByOrganizationId }),
      ),
    ).toBeTruthy();
    expect(model.dataValues).toEqual(plain.dataValues);
    expect(model.productDataModelId).toEqual(plain.productDataModelId);
  });

  it('add data values', () => {
    const plain = {
      name: 'My name',
      description: 'Some description',
      dataValues: [
        {
          id: 'd1',
          value: undefined,
          dataSectionId: 'sid1',
          dataFieldId: 'fieldId1',
        },
      ],
    };
    const model = Model.fromPlain(plain);
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
        dataSectionId: 'sid1',
        dataFieldId: 'fieldId1',
      }),
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
    const plain = {
      name: 'My name',
      description: 'Some description',
      dataValues: [
        {
          id: 'd1',
          value: undefined,
          dataSectionId: 'sid1',
          dataFieldId: 'fieldId1',
          row: 0,
        },
      ],
    };
    const model = Model.fromPlain(plain);
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

  it('is merged with plain', () => {
    const model = Model.fromPlain({
      name: 'My Name',
      description: 'Some description',
      dataValues: [
        { id: 'd1', value: undefined, dataSectionId: 's1', dataFieldId: 'f1' },
        { id: 'd2', value: 'v2', dataSectionId: 's1', dataFieldId: 'f2' },
        { id: 'd3', value: 'v3', dataSectionId: 's2', dataFieldId: 'f3' },
      ],
    });
    const plain = {
      name: 'Plain name',
      ownedByOrganizationId: randomUUID(),
      dataValues: [
        { id: 'd1', value: 'v1', fieldToIgnore: 3, dataFieldId: 'f9' },
        { id: 'd3', value: 'v3 new' },
      ],
      fieldToIgnore: 'hello',
    };
    const mergedModel = model.mergeWithPlain(plain);
    expect(mergedModel.id).toEqual(expect.any(String));
    expect(mergedModel.name).toEqual(plain.name);
    expect(mergedModel.description).toEqual(model.description);
    expect(
      mergedModel.isOwnedBy(
        Organization.fromPlain({ id: plain.ownedByOrganizationId }),
      ),
    ).toBeTruthy();
    expect(mergedModel.dataValues).toEqual([
      { id: 'd1', value: 'v1', dataSectionId: 's1', dataFieldId: 'f1' },
      { id: 'd2', value: 'v2', dataSectionId: 's1', dataFieldId: 'f2' },
      { id: 'd3', value: 'v3 new', dataSectionId: 's2', dataFieldId: 'f3' },
    ]);
  });
});
