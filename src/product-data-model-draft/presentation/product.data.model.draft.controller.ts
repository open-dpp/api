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
import { SectionType } from '../../product-data-model/domain/section';
import { DataSectionDraft } from '../domain/section.draft';
import { Organization } from '../../organizations/domain/organization';
import { DataFieldDraft } from '../domain/data.field.draft';
import { DataFieldType } from '../../product-data-model/domain/data.field';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product.data.model.service';

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
    @Body() createProductDataModelDraftDto: { name: string },
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
    @Body() modifyProductDataModelDraftDto: { name: string },
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
    @Body() createSectionDraftDto: { name: string; type: SectionType },
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
  ) {
    const organization = await this.organizationService.findOne(organizationId);

    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOne(draftId);

    this.hasPermissionsOrFail(organization, foundProductDataModelDraft, req);

    const publishedProductDataModel = foundProductDataModelDraft.publish(
      req.authContext.user,
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
    createDataFieldDraftDto: {
      name: string;
      type: DataFieldType;
      options?: Record<string, unknown>;
    },
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
    modifySectionDraftDto: {
      name?: string;
    },
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
    modifyDataFieldDraftDto: {
      name?: string;
      options?: Record<string, unknown>;
    },
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
