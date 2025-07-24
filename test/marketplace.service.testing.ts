import { Template } from '../src/templates/domain/template';
import { PassportTemplateDto, Sector } from '@open-dpp/api-client';
import { randomUUID } from 'crypto';
import {
  deserializeProductDataModel,
  serializeProductDataModel,
} from '../src/templates/domain/serialization';
import { InjectModel } from '@nestjs/mongoose';
import { TemplateDoc } from '../src/templates/infrastructure/template.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { TemplateService } from '../src/templates/infrastructure/template.service';

@Injectable()
export class MarketplaceServiceTesting {
  private readonly passportTemplateMap = new Map<string, PassportTemplateDto>();
  constructor(
    @InjectModel(TemplateDoc.name)
    private templateDoc: Model<TemplateDoc>,
    private templateService: TemplateService,
  ) {}

  async upload(
    template: Template,
    sectors: Sector[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ): Promise<PassportTemplateDto> {
    const passportTemplateDto = {
      id: `templateFor${template.id}`,
      sectors,
      name: template.name,
      description: template.description,
      ownedByOrganizationId: randomUUID(),
      createdByUserId: randomUUID(),
      contactEmail: 'test@example.com',
      isOfficial: false,
      createdAt: new Date(Date.now()).toISOString(),
      updatedAt: new Date(Date.now()).toISOString(),
      version: template.version,
      organizationName: 'orga name',
      templateData: serializeProductDataModel(template),
    };
    this.passportTemplateMap.set(passportTemplateDto.id, passportTemplateDto);
    return Promise.resolve(
      this.passportTemplateMap.get(passportTemplateDto.id)!,
    );
  }

  async download(
    organizationId: string,
    templateId: string,
  ): Promise<Template> {
    const passportTemplateDto: PassportTemplateDto =
      this.passportTemplateMap.get(templateId)!;
    const templateDoc = new this.templateDoc(passportTemplateDto.templateData);
    await templateDoc.validate();
    const template = deserializeProductDataModel(templateDoc.toObject());
    template.assignMarketplaceResource(passportTemplateDto.id);
    await this.templateService.save(template);
    return template;
  }
}
