import { ProductDataModel } from '../src/product-data-model/domain/product.data.model';
import { Sector } from '@open-dpp/api-client';

export class MarketplaceServiceTesting {
  constructor() {}

  async uploadToMarketplace(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    productDataModel: ProductDataModel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sectors: Sector[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ) {
    return {};
  }
}
