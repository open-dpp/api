import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ModelsService } from '../infrastructure/models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { AuthRequest } from '../../auth/auth-request';
import { DataValue, Model } from '../domain/model';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product.data.model.service';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { PermissionsService } from '../../auth/permissions/permissions.service';

@Controller('/organizations/:orgaId/models')
export class ModelsController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly organizationService: OrganizationsService,
    private readonly productDataModelService: ProductDataModelService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Body() createModelDto: CreateModelDto,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const organization = await this.organizationService.findOne(organizationId);
    if (organization === undefined) {
      throw new ForbiddenException();
    }
    const model = Model.create({
      name: createModelDto.name,
      user: req.authContext.user,
      organization: organization,
    });
    model.createUniqueProductIdentifier();
    return (await this.modelsService.save(model)).toPlain();
  }

  @Get()
  async findAll(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    return (await this.modelsService.findAllByOrganization(organizationId)).map(
      (m) => m.toPlain(),
    );
  }

  @Get(':modelId')
  async findOne(
    @Param('orgaId') organizationId: string,
    @Param('modelId') id: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOne(id);
    return model.toPlain();
  }

  @Patch(':modelId')
  async update(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Body() updateModelDto: UpdateModelDto,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOne(modelId);

    const mergedModel = model.mergeWithPlain(updateModelDto);
    return (await this.modelsService.save(mergedModel)).toPlain();
  }

  @Post(':modelId/product-data-models/:productDataModelId')
  async assignProductDataModelToModel(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Param('productDataModelId') productDataModelId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    // TODO: Check if user has permission to access product data model
    const productDataModel =
      await this.productDataModelService.findOne(productDataModelId);
    const model = await this.modelsService.findOne(modelId);

    model.assignProductDataModel(productDataModel);
    return (await this.modelsService.save(model)).toPlain();
  }

  @Patch(':modelId/data-values')
  async updateDataValues(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Body() updateDataValues: unknown,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOne(modelId);

    const mergedModel = model.mergeWithPlain({ dataValues: updateDataValues });
    const productDataModel = await this.productDataModelService.findOne(
      mergedModel.productDataModelId,
    );
    const validationResult = productDataModel.validate(mergedModel.dataValues);
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return (await this.modelsService.save(mergedModel)).toPlain();
  }

  @Post(':modelId/data-values')
  async addDataValues(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Body() addedDataValues: unknown[],
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOne(modelId);
    model.addDataValues(addedDataValues.map((d) => DataValue.fromPlain(d)));
    const productDataModel = await this.productDataModelService.findOne(
      model.productDataModelId,
    );
    const validationResult = productDataModel.validate(model.dataValues);
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return (await this.modelsService.save(model)).toPlain();
  }
}
