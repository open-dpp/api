import { ProductDataModel } from '../src/product-data-model/domain/product.data.model';
import { Sector } from '@open-dpp/api-client';
import { productDataModelDbPropsFactory } from '../src/product-data-model/fixtures/product-data-model.factory';

export class MarketplaceServiceTesting {
  constructor() {}

  async upload(
    productDataModel: ProductDataModel,
    sectors: Sector[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ) {
    return { id: `templateFor${productDataModel.id}`, sectors };
  }

  async download(templateId: string) {
    return ProductDataModel.loadFromDb({
      ...productDataModelDbPropsFactory.build({
        marketplaceResourceId: templateId,
      }),
    });
  }
}
