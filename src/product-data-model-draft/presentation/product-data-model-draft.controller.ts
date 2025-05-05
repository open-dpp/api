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
import { ProductDataModelDraft } from '../domain/product-data-model-draft';
import { AuthRequest } from '../../auth/auth-request';
import { DataSectionDraft } from '../domain/section-draft';
import { DataFieldDraft } from '../domain/data-field-draft';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { CreateProductDataModelDraftDto } from './dto/create-product-data-model-draft.dto';
import { CreateSectionDraftDto } from './dto/create-section-draft.dto';
import { CreateDataFieldDraftDto } from './dto/create-data-field-draft.dto';
import { UpdateProductDataModelDraftDto } from './dto/update-product-data-model-draft.dto';
import { PublishDto } from './dto/publish.dto';
import { UpdateDataFieldDraftDto } from './dto/update-data-field-draft.dto';
import { UpdateSectionDraftDto } from './dto/update-section-draft.dto';
import { ProductDataModelDraftService } from '../infrastructure/product-data-model-draft.service';
import { omit } from 'lodash';
import { PermissionsService } from '../../permissions/permissions.service';

import { Layout } from '../../data-modelling/domain/layout';

@Controller('/organizations/:orgaId/product-data-model-drafts')
export class ProductDataModelDraftController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly productDataModelService: ProductDataModelService,
    private readonly productDataModelDraftService: ProductDataModelDraftService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
    @Body() createProductDataModelDraftDto: CreateProductDataModelDraftDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    return (
      await this.productDataModelDraftService.save(
        ProductDataModelDraft.create({
          ...createProductDataModelDraftDto,
          organizationId,
          userId: req.authContext.user.id,
        }),
      )
    ).toPlain();
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    return foundProductDataModelDraft.toPlain();
  }

  @Patch(':draftId')
  async modify(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() modifyProductDataModelDraftDto: UpdateProductDataModelDraftDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.rename(modifyProductDataModelDraftDto.name);
    await this.productDataModelDraftService.save(foundProductDataModelDraft);

    return foundProductDataModelDraft.toPlain();
  }

  @Post(':draftId/sections')
  async addSection(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() createSectionDraftDto: CreateSectionDraftDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const section = DataSectionDraft.create({
      ...omit(createSectionDraftDto, ['parentSectionId', 'layout']),
      layout: Layout.fromPlain(createSectionDraftDto.layout),
    });

    if (createSectionDraftDto.parentSectionId) {
      foundProductDataModelDraft.addSubSection(
        createSectionDraftDto.parentSectionId,
        section,
      );
    } else {
      foundProductDataModelDraft.addSection(section);
    }
    return (
      await this.productDataModelDraftService.save(foundProductDataModelDraft)
    ).toPlain();
  }

  @Post(':draftId/publish')
  async publish(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() publishDto: PublishDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const publishedProductDataModel = foundProductDataModelDraft.publish(
      req.authContext.user.id,
      publishDto.visibility,
    );

    await this.productDataModelService.save(publishedProductDataModel);
    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );

    return draft.toPlain();
  }

  @Post(':draftId/sections/:sectionId/data-fields')
  async addDataFieldToSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body()
    createDataFieldDraftDto: CreateDataFieldDraftDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const dataField = DataFieldDraft.create({
      ...omit(createDataFieldDraftDto, ['layout']),
      layout: Layout.fromPlain(createDataFieldDraftDto.layout),
    });

    foundProductDataModelDraft.addDataFieldToSection(sectionId, dataField);

    return (
      await this.productDataModelDraftService.save(foundProductDataModelDraft)
    ).toPlain();
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.deleteSection(sectionId);

    return (
      await this.productDataModelDraftService.save(foundProductDataModelDraft)
    ).toPlain();
  }

  @Patch(':draftId/sections/:sectionId')
  async modifySection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Body()
    modifySectionDraftDto: UpdateSectionDraftDto,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.modifySection(
      sectionId,
      omit(modifySectionDraftDto),
    );

    return (
      await this.productDataModelDraftService.save(foundProductDataModelDraft)
    ).toPlain();
  }

  @Patch(':draftId/sections/:sectionId/data-fields/:fieldId')
  async modifyDataFieldOfSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Param('fieldId') fieldId: string,
    @Body()
    modifyDataFieldDraftDto: UpdateDataFieldDraftDto,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.modifyDataField(
      sectionId,
      fieldId,
      omit(modifyDataFieldDraftDto, 'view'),
    );

    return (
      await this.productDataModelDraftService.save(foundProductDataModelDraft)
    ).toPlain();
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.deleteDataFieldOfSection(sectionId, fieldId);

    return (
      await this.productDataModelDraftService.save(foundProductDataModelDraft)
    ).toPlain();
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

    return await this.productDataModelDraftService.findAllByOrganization(
      organizationId,
    );
  }

  private hasPermissionsOrFail(
    organizationId: string,
    productDataModelDraft: ProductDataModelDraft,
  ) {
    if (!productDataModelDraft.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
  }
}
