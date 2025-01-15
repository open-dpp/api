import { Item } from './item';
import { randomUUID } from 'crypto';

describe('Item', () => {
  it('should create an item and defines model', () => {
    const item = new Item();
    const productId = randomUUID();

    item.defineModel(productId);
    expect(item.model).toEqual(productId);
  });
});
