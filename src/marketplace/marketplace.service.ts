import {
  MarketplaceApiClient,
  PassportTemplateDto,
  Sector,
} from '@open-dpp/api-client';
import { ConfigService } from '@nestjs/config';
import { OrganizationsService } from '../organizations/infrastructure/organizations.service';
import {
  ProductDataModel,
  serializeProductDataModel,
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
    token: string,
  ): Promise<PassportTemplateDto> {
    const templateData = serializeProductDataModel(productDataModel);
    const organization = await this.organizationService.findOneOrFail(
      productDataModel.ownedByOrganizationId,
    );
    this.marketplaceClient.setActiveOrganizationId(organization.id);
    this.marketplaceClient.setApiKey(token);
    const response = await this.marketplaceClient.passportTemplates.create({
      version: productDataModel.version,
      name: productDataModel.name,
      description: `Vorlage ${productDataModel.name}`,
      sectors: sectors,
      organizationName: organization.name,
      templateData,
    });
    return response.data;
  }
}
