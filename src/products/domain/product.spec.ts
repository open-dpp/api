import { DataValue, Product } from './product';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import {
  DataSection,
  ProductDataModel,
  TextField,
} from '../../product-data-model/domain/product.data.model';

describe('Product', () => {
  it('should create unique product identifiers on product creation', () => {
    const product = new Product(undefined, 'My product', 'This is my product');
    const uniqueProductIdentifier1 = product.createUniqueProductIdentifier();
    const uniqueProductIdentifier2 = product.createUniqueProductIdentifier();

    expect(product.id).toBeDefined();
    expect(product.uniqueProductIdentifiers).toEqual([
      uniqueProductIdentifier1,
      uniqueProductIdentifier2,
    ]);
    expect(uniqueProductIdentifier1.getReference()).toEqual(product.id);
    expect(uniqueProductIdentifier2.getReference()).toEqual(product.id);
  });

  it('should assign owner for product', () => {
    const product = new Product(undefined, 'My product', 'This is my product');
    const user = new User(randomUUID());
    product.assignOwner(user);
    expect(product.owner).toEqual(user.id);
  });

  it('should assign product data model once', () => {
    const productDataModel = new ProductDataModel(
      'product-1',
      'Laptop',
      '1.0',
      [
        new DataSection('section-1', [
          new TextField('field-1', 'Title', { min: 2 }),
          new TextField('field-2', 'Title 2', { min: 7 }),
        ]),
        new DataSection('section-2', [
          new TextField('field-3', 'Title 3', { min: 8 }),
        ]),
      ],
    );
    const product = new Product(undefined, 'My product', 'This is my product');
    product.assignProductDataModel(productDataModel);
    expect(product.productDataModelId).toEqual(productDataModel.id);
    expect(product.dataValues).toEqual([
      new DataValue(expect.any(String), undefined, 'section-1', 'field-1'),
      new DataValue(expect.any(String), undefined, 'section-1', 'field-2'),
      new DataValue(expect.any(String), undefined, 'section-2', 'field-3'),
    ]);
    // Fail if product model is assigned again
    expect(() => product.assignProductDataModel(productDataModel)).toThrow(
      'This model is already connected to a product data model',
    );
  });
});
