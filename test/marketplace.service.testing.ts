import { ProductDataModel } from '../src/product-data-model/domain/product.data.model';
import { Sector } from '@open-dpp/api-client';

export class MarketplaceServiceTesting {
  constructor() {}

  async uploadToMarketplace(
    productDataModel: ProductDataModel,
    sectors: Sector[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ) {
    return { id: `templateFor${productDataModel.id}`, sectors };
  }
}
