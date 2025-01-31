import { Product } from './product';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

describe('Product', () => {
  it('should create unique product identifiers on product creation', () => {
    const product = new Product(undefined, 'My product', 'This is my product');
    const permalink1 = product.createUniqueProductIdentifier();
    const permalink2 = product.createUniqueProductIdentifier();

    expect(product.id).toBeDefined();
    expect(product.uniqueProductIdentifiers).toEqual([permalink1, permalink2]);
    expect(permalink1.getReference()).toEqual(product.id);
    expect(permalink2.getReference()).toEqual(product.id);
  });

  it('should assign owner for product', () => {
    const product = new Product(undefined, 'My product', 'This is my product');
    const user = new User(randomUUID());
    product.assignOwner(user);
    expect(product.owner).toEqual(user.id);
  });
});
