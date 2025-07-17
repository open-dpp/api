import { MarketplaceApiClient, Sector } from '@open-dpp/api-client';
import { ConfigService } from '@nestjs/config';
import { OrganizationsService } from '../organizations/infrastructure/organizations.service';
import {
  ProductDataModel,
  serialize,
} from '../product-data-model/domain/product.data.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketplaceService {
  private readonly marketplaceClient: MarketplaceApiClient;

  constructor(
    configService: ConfigService,
    private organizationService: OrganizationsService,
  ) {
    const baseURL = configService.get<string>('MARKETPLACE_URL');
    if (!baseURL) {
      throw new Error('MARKETPLACE_URL is not set');
    }
    this.marketplaceClient = new MarketplaceApiClient({ baseURL });
  }
  async uploadToMarketplace(
    productDataModel: ProductDataModel,
    sectors: Sector[],
  ) {
    const templateData = serialize(productDataModel);
    const organization = await this.organizationService.findOneOrFail(
      productDataModel.ownedByOrganizationId,
    );
    this.marketplaceClient.setActiveOrganizationId(organization.id);
    return await this.marketplaceClient.passportTemplates.create({
      version: productDataModel.version,
      name: productDataModel.name,
      description: `Vorlage ${productDataModel.name}`,
      sectors: sectors,
      organizationName: organization.name,
      templateData,
    });
  }
}
