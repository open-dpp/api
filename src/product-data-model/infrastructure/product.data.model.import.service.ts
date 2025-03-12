import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ProductDataModelService } from './product.data.model.service';
import { ProductDataModel } from '../domain/product.data.model';

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
        sections: [
          {
            name: 'Technische Spezifikation',
            type: 'Group',
            dataFields: [
              {
                name: 'Prozessor',
                type: 'TextField',
              },
              {
                name: 'Arbeitsspeicher',
                type: 'TextField',
              },
            ],
          },
          {
            name: 'Material',
            type: 'Repeatable',
            dataFields: [
              {
                name: 'Materialnummer',
                type: 'TextField',
              },
              {
                name: 'Materialanteil',
                type: 'TextField',
              },
            ],
          },
        ],
      });
      await this.productDataModelService.save(productDataModel);
    }
  }
}
