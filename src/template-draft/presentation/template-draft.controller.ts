import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { TemplateDraft } from '../domain/template-draft';
import { AuthRequest } from '../../auth/auth-request';
import { DataSectionDraft } from '../domain/section-draft';
import { DataFieldDraft } from '../domain/data-field-draft';
import { TemplateService } from '../../templates/infrastructure/template.service';
import {
  CreateTemplateDraftDto,
  CreateTemplateDraftDtoSchema,
} from './dto/create-template-draft.dto';
import {
  CreateSectionDraftDto,
  CreateSectionDraftDtoSchema,
} from './dto/create-section-draft.dto';
import {
  CreateDataFieldDraftDto,
  CreateDataFieldDraftSchema,
} from './dto/create-data-field-draft.dto';
import {
  UpdateTemplateDraftDto,
  UpdateTemplateDraftDtoSchema,
} from './dto/update-template-draft.dto';
import {
  PublishDto,
  PublishDtoSchema,
  VisibilityLevel,
} from './dto/publish.dto';
import {
  UpdateDataFieldDraftDto,
  UpdateDataFieldDraftDtoSchema,
} from './dto/update-data-field-draft.dto';

import { TemplateDraftService } from '../infrastructure/template-draft.service';
import { omit } from 'lodash';
import { PermissionsService } from '../../permissions/permissions.service';

import { Layout } from '../../data-modelling/domain/layout';
import {
  UpdateSectionDraftDto,
  UpdateSectionDraftDtoSchema,
} from './dto/update-section-draft.dto';
import { templateDraftToDto } from './dto/template-draft.dto';
import { MarketplaceService } from '../../marketplace/marketplace.service';

@Controller('/organizations/:orgaId/template-drafts')
export class TemplateDraftController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly templateService: TemplateService,
    private readonly templateDraftService: TemplateDraftService,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
    @Body() body: CreateTemplateDraftDto,
  ) {
    const createTemplateDraftDto =
      CreateTemplateDraftDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    return templateDraftToDto(
      await this.templateDraftService.save(
        TemplateDraft.create({
          ...createTemplateDraftDto,
          organizationId,
          userId: req.authContext.user.id,
        }),
      ),
    );
  }

  @Get(':draftId')
  async get(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    return templateDraftToDto(foundProductDataModelDraft);
  }

  @Patch(':draftId')
  async modify(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() body: UpdateTemplateDraftDto,
  ) {
    const updateTemplateDraftDto =
      UpdateTemplateDraftDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.rename(updateTemplateDraftDto.name);
    await this.templateDraftService.save(foundProductDataModelDraft);

    return templateDraftToDto(foundProductDataModelDraft);
  }

  @Post(':draftId/sections')
  async addSection(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() body: CreateSectionDraftDto,
  ) {
    const createSectionDraftDto = CreateSectionDraftDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const section = DataSectionDraft.create({
      ...omit(createSectionDraftDto, ['parentSectionId', 'layout']),
      layout: Layout.create(createSectionDraftDto.layout),
    });

    if (createSectionDraftDto.parentSectionId) {
      foundProductDataModelDraft.addSubSection(
        createSectionDraftDto.parentSectionId,
        section,
      );
    } else {
      foundProductDataModelDraft.addSection(section);
    }
    return templateDraftToDto(
      await this.templateDraftService.save(foundProductDataModelDraft),
    );
  }

  @Post(':draftId/publish')
  async publish(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() body: PublishDto,
  ) {
    const publishDto = PublishDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const publishedProductDataModel = foundProductDataModelDraft.publish(
      req.authContext.user.id,
    );

    if (publishDto.visibility === VisibilityLevel.PUBLIC) {
      const marketplaceResponse = await this.marketplaceService.upload(
        publishedProductDataModel,
        req.authContext.token,
      );
      publishedProductDataModel.assignMarketplaceResource(
        marketplaceResponse.id,
      );
    }

    await this.templateService.save(publishedProductDataModel);
    const draft = await this.templateDraftService.save(
      foundProductDataModelDraft,
      publishedProductDataModel.version,
    );

    return templateDraftToDto(draft);
  }

  @Post(':draftId/sections/:sectionId/data-fields')
  async addDataFieldToSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body()
    body: CreateDataFieldDraftDto,
  ) {
    const createDataFieldDraftDto = CreateDataFieldDraftSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const dataField = DataFieldDraft.create({
      ...omit(createDataFieldDraftDto, ['layout']),
      layout: Layout.create(createDataFieldDraftDto.layout),
    });

    foundProductDataModelDraft.addDataFieldToSection(sectionId, dataField);

    return templateDraftToDto(
      await this.templateDraftService.save(foundProductDataModelDraft),
    );
  }

  @Delete(':draftId/sections/:sectionId')
  async deleteSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.deleteSection(sectionId);

    return templateDraftToDto(
      await this.templateDraftService.save(foundProductDataModelDraft),
    );
  }

  @Patch(':draftId/sections/:sectionId')
  async modifySection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Body() body: UpdateSectionDraftDto,
    @Request() req: AuthRequest,
  ) {
    const modifySectionDraftDto = UpdateSectionDraftDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.modifySection(
      sectionId,
      omit(modifySectionDraftDto),
    );

    return templateDraftToDto(
      await this.templateDraftService.save(foundProductDataModelDraft),
    );
  }

  @Patch(':draftId/sections/:sectionId/data-fields/:fieldId')
  async modifyDataFieldOfSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Param('fieldId') fieldId: string,
    @Body() body: UpdateDataFieldDraftDto,
    @Request() req: AuthRequest,
  ) {
    const modifyDataFieldDraftDto = UpdateDataFieldDraftDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.modifyDataField(
      sectionId,
      fieldId,
      omit(modifyDataFieldDraftDto, 'view'),
    );

    return templateDraftToDto(
      await this.templateDraftService.save(foundProductDataModelDraft),
    );
  }

  @Delete(':draftId/sections/:sectionId/data-fields/:fieldId')
  async deleteDataFieldOfSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Param('fieldId') fieldId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.deleteDataFieldOfSection(sectionId, fieldId);

    return templateDraftToDto(
      await this.templateDraftService.save(foundProductDataModelDraft),
    );
  }

  @Get()
  async findAllOfOrganization(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    return await this.templateDraftService.findAllByOrganization(
      organizationId,
    );
  }

  private hasPermissionsOrFail(
    organizationId: string,
    templateDraft: TemplateDraft,
  ) {
    if (!templateDraft.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
  }
}