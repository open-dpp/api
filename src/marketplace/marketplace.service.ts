import {
  MarketplaceApiClient,
  PassportTemplateDto,
} from '@open-dpp/api-client';
import { ConfigService } from '@nestjs/config';
import { OrganizationsService } from '../organizations/infrastructure/organizations.service';
import { ProductDataModel } from '../product-data-model/domain/product.data.model';
import { Injectable } from '@nestjs/common';
import {
  deserializeProductDataModel,
  serializeProductDataModel,
} from '../product-data-model/domain/serialization';
import { ProductDataModelDoc } from '../product-data-model/infrastructure/product-data-model.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MarketplaceService {
  private readonly marketplaceClient: MarketplaceApiClient;

  constructor(
    configService: ConfigService,
    private organizationService: OrganizationsService,
    @InjectModel(ProductDataModelDoc.name)
    private productDataModelDoc: Model<ProductDataModelDoc>,
  ) {
    const baseURL = configService.get<string>('MARKETPLACE_URL');
    if (!baseURL) {
      throw new Error('MARKETPLACE_URL is not set');
    }
    this.marketplaceClient = new MarketplaceApiClient({ baseURL });
  }
  async upload(
    productDataModel: ProductDataModel,
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
      description: productDataModel.description,
      sectors: productDataModel.sectors,
      organizationName: organization.name,
      templateData,
    });
    return response.data;
  }

  async download(templateId: string): Promise<ProductDataModel> {
    const response =
      await this.marketplaceClient.passportTemplates.getById(templateId);
    const productDataModelDoc = new this.productDataModelDoc(
      response.data.templateData,
    );
    await productDataModelDoc.validate();

    const productDataModel = deserializeProductDataModel(
      productDataModelDoc.toObject(),
    );
    productDataModel.assignMarketplaceResource(response.data.id);
    return productDataModel;
  }
}
