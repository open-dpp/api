import { Item } from './item';
import { randomUUID } from 'crypto';

describe('Item', () => {
  it('should create an item and defines model', () => {
    const item = new Item();
    const modelId = randomUUID();
    const modelOwner = randomUUID();
    item.defineModel({ modelId, modelOwner });
    expect(item.model).toEqual(modelId);
    expect(item.owner).toEqual(modelOwner);
  });
});
