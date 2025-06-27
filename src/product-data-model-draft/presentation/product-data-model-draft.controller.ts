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
import {
  CreateProductDataModelDraftDto,
  CreateProductDataModelDraftDtoSchema,
} from './dto/create-product-data-model-draft.dto';
import {
  CreateSectionDraftDto,
  CreateSectionDraftDtoSchema,
} from './dto/create-section-draft.dto';
import {
  CreateDataFieldDraftDto,
  CreateDataFieldDraftSchema,
} from './dto/create-data-field-draft.dto';
import {
  UpdateProductDataModelDraftDto,
  UpdateProductDataModelDraftDtoSchema,
} from './dto/update-product-data-model-draft.dto';
import { PublishDto, PublishDtoSchema } from './dto/publish.dto';
import {
  UpdateDataFieldDraftDto,
  UpdateDataFieldDraftDtoSchema,
} from './dto/update-data-field-draft.dto';

import { ProductDataModelDraftService } from '../infrastructure/product-data-model-draft.service';
import { omit } from 'lodash';
import { PermissionsService } from '../../permissions/permissions.service';

import { Layout } from '../../data-modelling/domain/layout';
import {
  UpdateSectionDraftDto,
  UpdateSectionDraftDtoSchema,
} from './dto/update-section-draft.dto';
import { productDataModelDraftToDto } from './dto/product-data-model-draft.dto';

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
    @Body() body: CreateProductDataModelDraftDto,
  ) {
    const createProductDataModelDraftDto =
      CreateProductDataModelDraftDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    return productDataModelDraftToDto(
      await this.productDataModelDraftService.save(
        ProductDataModelDraft.create({
          ...createProductDataModelDraftDto,
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    return productDataModelDraftToDto(foundProductDataModelDraft);
  }

  @Patch(':draftId')
  async modify(
    @Param('orgaId') organizationId: string,
    @Param('draftId') draftId: string,
    @Request() req: AuthRequest,
    @Body() body: UpdateProductDataModelDraftDto,
  ) {
    const modifyProductDataModelDraftDto =
      UpdateProductDataModelDraftDtoSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const foundProductDataModelDraft =
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.rename(modifyProductDataModelDraftDto.name);
    await this.productDataModelDraftService.save(foundProductDataModelDraft);

    return productDataModelDraftToDto(foundProductDataModelDraft);
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

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
    return productDataModelDraftToDto(
      await this.productDataModelDraftService.save(foundProductDataModelDraft),
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const publishedProductDataModel = foundProductDataModelDraft.publish(
      req.authContext.user.id,
      publishDto.visibility,
    );

    await this.productDataModelService.save(publishedProductDataModel);
    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
      publishedProductDataModel.version,
    );

    return productDataModelDraftToDto(draft);
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    const dataField = DataFieldDraft.create({
      ...omit(createDataFieldDraftDto, ['layout']),
      layout: Layout.create(createDataFieldDraftDto.layout),
    });

    foundProductDataModelDraft.addDataFieldToSection(sectionId, dataField);

    return productDataModelDraftToDto(
      await this.productDataModelDraftService.save(foundProductDataModelDraft),
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.deleteSection(sectionId);

    return productDataModelDraftToDto(
      await this.productDataModelDraftService.save(foundProductDataModelDraft),
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.modifySection(
      sectionId,
      omit(modifySectionDraftDto),
    );

    return productDataModelDraftToDto(
      await this.productDataModelDraftService.save(foundProductDataModelDraft),
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.modifyDataField(
      sectionId,
      fieldId,
      omit(modifyDataFieldDraftDto, 'view'),
    );

    return productDataModelDraftToDto(
      await this.productDataModelDraftService.save(foundProductDataModelDraft),
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
      await this.productDataModelDraftService.findOneOrFail(draftId);

    this.hasPermissionsOrFail(organizationId, foundProductDataModelDraft);

    foundProductDataModelDraft.deleteDataFieldOfSection(sectionId, fieldId);

    return productDataModelDraftToDto(
      await this.productDataModelDraftService.save(foundProductDataModelDraft),
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
