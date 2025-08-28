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
import { SectionDraft } from '../domain/section-draft';
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

import {
  UpdateSectionDraftDto,
  UpdateSectionDraftDtoSchema,
} from './dto/update-section-draft.dto';
import { templateDraftToDto } from './dto/template-draft.dto';
import { MarketplaceService } from '../../marketplace/marketplace.service';
import { ZodValidationPipe } from '../../exceptions/zod-validation.pipeline';
import { MoveDto, MoveDtoSchema } from './dto/move.dto';

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
    @Body(new ZodValidationPipe(CreateTemplateDraftDtoSchema))
    createTemplateDraftDto: CreateTemplateDraftDto,
  ) {
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
    @Body(new ZodValidationPipe(UpdateTemplateDraftDtoSchema))
    updateTemplateDraftDto: UpdateTemplateDraftDto,
  ) {
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
    @Body(new ZodValidationPipe(CreateSectionDraftDtoSchema))
    createSectionDraftDto: CreateSectionDraftDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const section = SectionDraft.create({
      ...omit(createSectionDraftDto, ['parentSectionId']),
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
    @Body(new ZodValidationPipe(PublishDtoSchema)) publishDto: PublishDto,
  ) {
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
    @Body(new ZodValidationPipe(CreateDataFieldDraftSchema))
    createDataFieldDraftDto: CreateDataFieldDraftDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const dataField = DataFieldDraft.create(createDataFieldDraftDto);

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
    @Body(new ZodValidationPipe(UpdateSectionDraftDtoSchema))
    modifySectionDraftDto: UpdateSectionDraftDto,
    @Request() req: AuthRequest,
  ) {
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

  @Post(':draftId/sections/:sectionId/move')
  async moveSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Body(new ZodValidationPipe(MoveDtoSchema))
    moveDto: MoveDto,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.moveSection(sectionId, moveDto.direction);

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
    @Body(new ZodValidationPipe(UpdateDataFieldDraftDtoSchema))
    modifyDataFieldDraftDto: UpdateDataFieldDraftDto,
    @Request() req: AuthRequest,
  ) {
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

  @Post(':draftId/sections/:sectionId/data-fields/:fieldId/move')
  async moveDataField(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('fieldId') fieldId: string,
    @Param('draftId') draftId: string,
    @Body(new ZodValidationPipe(MoveDtoSchema))
    moveDto: MoveDto,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.templateDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.moveDataField(
      sectionId,
      fieldId,
      moveDto.direction,
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
