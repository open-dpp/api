import { Item } from './item';
import { randomUUID } from 'crypto';
import { DataValue } from '../../passport/passport';

describe('Item', () => {
  it('should create an item and defines model', () => {
    const item = Item.create();
    const productId = randomUUID();

    item.defineModel(productId);
    expect(item.modelId).toEqual(productId);
  });

  it('should create unique product identifier on item creation', () => {
    const item = Item.create();
    const uniqueProductIdentifier1 = item.createUniqueProductIdentifier();
    const uniqueProductIdentifier2 = item.createUniqueProductIdentifier();

    expect(item.id).toBeDefined();
    expect(item.uniqueProductIdentifiers).toEqual([
      uniqueProductIdentifier1,
      uniqueProductIdentifier2,
    ]);
    expect(uniqueProductIdentifier1.referenceId).toEqual(item.id);
    expect(uniqueProductIdentifier2.referenceId).toEqual(item.id);
  });

  it('add data values', () => {
    const item = Item.create();
    item.addDataValues([
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
    expect(item.dataValues).toEqual([
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
});
