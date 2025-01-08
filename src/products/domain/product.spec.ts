import { Product } from './product';

describe('Product', () => {
  it('should create permalinks', () => {
    const product = new Product(undefined, 'My product', 'This is my product');
    const permalink1 = product.createPermalink();
    const permalink2 = product.createPermalink();

    expect(product.id).toBeDefined();
    expect(product.permalinks).toEqual([permalink1, permalink2]);
    expect(permalink1.getReference()).toEqual(product.id);
    expect(permalink2.getReference()).toEqual(product.id);
  });
});
