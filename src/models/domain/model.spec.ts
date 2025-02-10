import { Model } from './model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

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

  it('should assign owner for model', () => {
    const model = Model.fromPlain({
      name: 'My model',
      description: 'This is my model',
    });
    const user = new User(randomUUID());
    model.assignOwner(user);
    expect(model.owner).toEqual(user.id);
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
    expect(model.owner).toBeUndefined();
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
      owner: randomUUID(),
    };
    const model = Model.fromPlain(plain);
    expect(model.id).toEqual(plain.id);
    expect(model.name).toEqual(plain.name);
    expect(model.description).toEqual(plain.description);
    expect(model.owner).toEqual(plain.owner);
    expect(model.dataValues).toEqual(plain.dataValues);
    expect(model.productDataModelId).toEqual(plain.productDataModelId);
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
      owner: randomUUID(),
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
    expect(mergedModel.owner).toEqual(plain.owner);
    expect(mergedModel.dataValues).toEqual([
      { id: 'd1', value: 'v1', dataSectionId: 's1', dataFieldId: 'f1' },
      { id: 'd2', value: 'v2', dataSectionId: 's1', dataFieldId: 'f2' },
      { id: 'd3', value: 'v3 new', dataSectionId: 's2', dataFieldId: 'f3' },
    ]);
  });
});
