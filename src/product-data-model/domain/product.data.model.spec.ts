import { plainToInstance } from 'class-transformer';
import { DataSection, ProductDataModel, TextField } from './product.data.model';

describe('ProductDataModel', () => {
  it('is created from json', () => {
    const json = {
      id: 'product-1',
      version: '1.0',
      sections: [
        {
          id: 'section-1',
          dataFields: [
            {
              id: 'field-1',
              type: 'TextField',
              name: 'Title',
              value: 'Hello World',
            },
          ],
        },
      ],
    };

    const productDataModel = plainToInstance(ProductDataModel, json);
    expect(productDataModel).toEqual(
      new ProductDataModel('product-1', '1.0', [
        new DataSection('section-1', [
          new TextField('field-1', 'Title', 'Hello World'),
        ]),
      ]),
    );
  });
});
