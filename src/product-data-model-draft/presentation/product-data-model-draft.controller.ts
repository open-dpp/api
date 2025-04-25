import {
  BadRequestException,
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
import { ViewService } from '../../view/infrastructure/view.service';
import { TargetGroup, View } from '../../view/domain/view';
import {
  DataFieldRef,
  isDataFieldRef,
  isSectionGrid,
  SectionGrid,
} from '../../view/domain/node';
import { instanceToPlain } from 'class-transformer';

@Controller('/organizations/:orgaId/product-data-model-drafts')
export class ProductDataModelDraftController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly productDataModelService: ProductDataModelService,
    private readonly productDataModelDraftService: ProductDataModelDraftService,
    private readonly viewService: ViewService,
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

    const draft = await this.productDataModelDraftService.save(
      ProductDataModelDraft.create({
        ...createProductDataModelDraftDto,
        organizationId,
        userId: req.authContext.user.id,
      }),
    );
    const view = await this.viewService.save(
      View.create({
        targetGroup: TargetGroup.ALL,
        dataModelId: draft.id,
      }),
    );

    return { data: draft.toPlain(), view: view.toPlain() };
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
    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );

    return {
      data: foundProductDataModelDraft.toPlain(),
      view: foundView.toPlain(),
    };
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
    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );

    return {
      data: foundProductDataModelDraft.toPlain(),
      view: foundView.toPlain(),
    };
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

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );
    const section = DataSectionDraft.create(
      omit(createSectionDraftDto, ['parentSectionId', 'view']),
    );
    const viewDto = createSectionDraftDto.view;
    const sectionGrid = SectionGrid.create({
      cols: viewDto.cols,
      colStart: viewDto.colStart,
      colSpan: viewDto.colSpan,
      rowStart: viewDto.rowStart,
      rowSpan: viewDto.rowSpan,
      sectionId: section.id,
    });

    if (createSectionDraftDto.parentSectionId) {
      foundProductDataModelDraft.addSubSection(
        createSectionDraftDto.parentSectionId,
        section,
      );
      const { node: parentNode } = foundView.findNodeWithParentBySectionId(
        createSectionDraftDto.parentSectionId,
      );
      foundView.addNode(sectionGrid, parentNode.id);
    } else {
      foundProductDataModelDraft.addSection(section);
      foundView.addNode(sectionGrid);
    }

    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );
    const view = await this.viewService.save(foundView);

    return { data: draft.toPlain(), view: view.toPlain() };
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

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );
    const publishedView = foundView.publish(publishedProductDataModel.id);

    await this.productDataModelService.save(publishedProductDataModel);
    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );
    await this.viewService.save(publishedView);

    return { data: draft.toPlain(), view: foundView };
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

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );

    const dataField = DataFieldDraft.create(
      omit(createDataFieldDraftDto, 'view'),
    );

    foundProductDataModelDraft.addDataFieldToSection(sectionId, dataField);
    const viewDto = createDataFieldDraftDto.view;
    const { node } = foundView.findNodeWithParentBySectionId(sectionId);
    foundView.addNode(
      DataFieldRef.create({
        fieldId: dataField.id,
        colStart: viewDto.colStart,
        colSpan: viewDto.colSpan,
        rowStart: viewDto.rowStart,
        rowSpan: viewDto.rowSpan,
      }),
      node.id,
    );

    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );
    const view = await this.viewService.save(foundView);

    return { data: draft.toPlain(), view: view.toPlain() };
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

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );

    foundProductDataModelDraft.deleteSection(sectionId);
    const { node } = foundView.findNodeWithParentBySectionId(sectionId);
    foundView.deleteNodeById(node.id);

    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );
    const view = await this.viewService.save(foundView);

    return { data: draft.toPlain(), view: view.toPlain() };
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

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );

    foundProductDataModelDraft.modifySection(
      sectionId,
      omit(modifySectionDraftDto, 'view'),
    );

    const viewDto = modifySectionDraftDto.view;
    const { node } = foundView.findNodeWithParentBySectionId(sectionId);
    if (!isSectionGrid(node)) {
      throw new BadRequestException('Node is not a section grid');
    }
    node.modifyConfigs(omit(instanceToPlain(viewDto), 'cols'));
    node.modifyCols(viewDto.cols);

    const view = await this.viewService.save(foundView);
    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );

    return { data: draft.toPlain(), view: view.toPlain() };
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

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );
    const { node } = foundView.findNodeWithParentByFieldId(fieldId);
    if (!isDataFieldRef(node)) {
      throw new BadRequestException('Node is not a data field ref');
    }
    node.modifyConfigs(instanceToPlain(modifyDataFieldDraftDto.view));

    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );
    const view = await this.viewService.save(foundView);

    return { data: draft.toPlain(), view: view.toPlain() };
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

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        draftId,
        TargetGroup.ALL,
      );

    foundProductDataModelDraft.deleteDataFieldOfSection(sectionId, fieldId);
    const { node } = foundView.findNodeWithParentByFieldId(fieldId);
    foundView.deleteNodeById(node.id);

    const view = await this.viewService.save(foundView);
    const draft = await this.productDataModelDraftService.save(
      foundProductDataModelDraft,
    );

    return { data: draft.toPlain(), view: view.toPlain() };
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
