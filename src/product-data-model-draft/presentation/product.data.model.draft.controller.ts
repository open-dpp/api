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
import { ProductDataModelDraftService } from '../infrastructure/product.data.model.draft.service';
import { ProductDataModelDraft } from '../domain/product.data.model.draft';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { AuthRequest } from '../../auth/auth-request';
import { DataSectionDraft } from '../domain/section.draft';
import { Organization } from '../../organizations/domain/organization';
import { DataFieldDraft } from '../domain/data.field.draft';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product.data.model.service';
import { CreateProductDataModelDraftDto } from './dto/create.product.data.model.draft.dto';
import { CreateSectionDraftDto } from './dto/create.section.draft.dto';
import { CreateDataFieldDraftDto } from './dto/create.data.field.draft.dto';
import { UpdateProductDataModelDraftDto } from './dto/update.product.data.model.draft.dto';
import { PublishDto } from './dto/publish.dto';
import { UpdateDataFieldDraftDto } from './dto/update.data.field.draft.dto';
import { UpdateSectionDraftDto } from './dto/update.section.draft.dto';

@Controller('/organizations/:orgaId/product-data-model-drafts')
export class ProductDataModelDraftController {
  constructor(
    private readonly productDataModelDraftService: ProductDataModelDraftService,
    private readonly organizationService: OrganizationsService,
    private readonly productDataModelService: ProductDataModelService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
    @Body() createProductDataModelDraftDto: CreateProductDataModelDraftDto,
  ) {
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    return (
      await this.productDataModelDraftService.save(
        ProductDataModelDraft.create({
          ...createProductDataModelDraftDto,
          organization,
          user: req.authContext.user,
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
    const organization = await this.organizationService.findOne(organizationId);
    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    return foundProductDataModelDraft.toPlain();
  }

  @Patch(':draftId')
  async modify(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() modifyProductDataModelDraftDto: UpdateProductDataModelDraftDto,
  ) {
    const organization = await this.organizationService.findOne(organizationId);
    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    foundProductDataModelDraft.rename(modifyProductDataModelDraftDto.name);

    return (
      await this.productDataModelDraftService.save(foundProductDataModelDraft)
    ).toPlain();
  }

  @Post(':draftId/sections')
  async addSection(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() createSectionDraftDto: CreateSectionDraftDto,
  ) {
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    foundProductDataModelDraft.addSection(
      DataSectionDraft.create(createSectionDraftDto),
    );
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
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    const publishedProductDataModel = foundProductDataModelDraft.publish(
      req.authContext.user,
      publishDto.visibility,
    );
    return (
      await this.productDataModelService.save(publishedProductDataModel)
    ).toPlain();
  }

  @Post(':draftId/sections/:sectionId')
  async addDataFieldToSection(
    @Param('orgaId') organizationId: string,
    @Param('sectionId') sectionId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body()
    createDataFieldDraftDto: CreateDataFieldDraftDto,
  ) {
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    foundProductDataModelDraft.addDataFieldToSection(
      sectionId,
      DataFieldDraft.create(createDataFieldDraftDto),
    );
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
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

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
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    foundProductDataModelDraft.modifySection(sectionId, modifySectionDraftDto);
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
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    foundProductDataModelDraft.modifyDataField(
      sectionId,
      fieldId,
      modifyDataFieldDraftDto,
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
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

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
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    return await this.productDataModelDraftService.findAllByOrganization(
      organization.id,
    );
  }

  private hasPermissionsOrFail(
    organization: Organization,
    productDataModelDraft: ProductDataModelDraft,
    req: AuthRequest,
  ) {
    if (
      organization === undefined ||
      !organization.isMember(req.authContext.user)
    ) {
      throw new ForbiddenException();
    }
    if (!productDataModelDraft.isOwnedBy(organization)) {
      throw new ForbiddenException();
    }
  }
}
