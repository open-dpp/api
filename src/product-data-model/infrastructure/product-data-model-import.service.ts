import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ProductDataModelService } from './product-data-model.service';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../domain/product.data.model';

@Injectable()
export class ProductDataModelImportService implements OnApplicationBootstrap {
  constructor(private productDataModelService: ProductDataModelService) {}
  async onApplicationBootstrap() {
    const name = 'Standard Laptop';
    const found = await this.productDataModelService.findByName(name);

    if (found.length === 0) {
      const productDataModel = ProductDataModel.fromPlain({
        name,
        version: '1.0.0',
        visibility: VisibilityLevel.PUBLIC,
        sections: [
          {
            layout: {
              cols: { sm: 2 },
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            name: 'Technische Spezifikation',
            type: 'Group',
            dataFields: [
              {
                name: 'Prozessor',
                type: 'TextField',
                layout: {
                  colStart: { sm: 1 },
                  colSpan: { sm: 1 },
                  rowStart: { sm: 1 },
                  rowSpan: { sm: 1 },
                },
              },
              {
                name: 'Arbeitsspeicher',
                type: 'TextField',
                layout: {
                  colStart: { sm: 2 },
                  colSpan: { sm: 1 },
                  rowStart: { sm: 1 },
                  rowSpan: { sm: 1 },
                },
              },
            ],
          },
          {
            name: 'Material',
            type: 'Repeatable',
            layout: {
              cols: { sm: 2 },
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 2 },
              rowSpan: { sm: 1 },
            },
            dataFields: [
              {
                name: 'Materialnummer',
                type: 'TextField',
                layout: {
                  colStart: { sm: 1 },
                  colSpan: { sm: 1 },
                  rowStart: { sm: 1 },
                  rowSpan: { sm: 1 },
                },
              },
              {
                name: 'Materialanteil',
                type: 'TextField',
                layout: {
                  colStart: { sm: 2 },
                  colSpan: { sm: 1 },
                  rowStart: { sm: 1 },
                  rowSpan: { sm: 1 },
                },
              },
            ],
          },
        ],
      });
      await this.productDataModelService.save(productDataModel);
    }
  }
}
