import { Template } from '../src/templates/domain/template';
import { Sector } from '@open-dpp/api-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketplaceServiceTesting {
  private readonly templateMap = new Map<string, Template>();
  constructor() {}

  async upload(
    template: Template,
    sectors: Sector[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ) {
    const marketplaceResourceId = `templateFor${template.id}`;

    this.templateMap.set(marketplaceResourceId, template);
    return {
      id: marketplaceResourceId,
      sectors,
    };
  }

  async download(
    organizationId: string,

    userId: string,
    marketplaceResourceId: string,
  ): Promise<Template> {
    const template = this.templateMap.get(marketplaceResourceId)!;
    template.assignMarketplaceResource(marketplaceResourceId);
    return template;
  }
}
