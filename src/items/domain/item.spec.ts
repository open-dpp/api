import { Item } from './item';
import { randomUUID } from 'crypto';

describe('Item', () => {
  it('should create an item and defines model', () => {
    const item = new Item();
    const productId = randomUUID();

    item.defineModel(productId);
    expect(item.model).toEqual(productId);
  });

  it('should create unique product identifier on item creation', () => {
    const item = new Item();
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
});
