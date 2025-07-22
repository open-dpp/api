import { Template } from '../src/templates/domain/template';
import { Sector } from '@open-dpp/api-client';
import { laptopFactory } from '../src/templates/fixtures/laptop.factory';

export class MarketplaceServiceTesting {
  constructor() {}

  async upload(
    productDataModel: Template,
    sectors: Sector[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ) {
    return { id: `templateFor${productDataModel.id}`, sectors };
  }

  async download(templateId: string) {
    return Template.loadFromDb(
      laptopFactory.build({ marketplaceResourceId: templateId }),
    );
  }
}
