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
import { CreateModelDto, CreateModelDtoSchema } from './dto/create-model.dto';
import { UpdateModelDto, UpdateModelDtoSchema } from './dto/update-model.dto';
import { AuthRequest } from '../../auth/auth-request';
import { Model } from '../domain/model';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { PermissionsService } from '../../permissions/permissions.service';
import { DataValue } from '../../passport/passport';
import {
  UpdateDataValueDto,
  UpdateDataValueDtoSchema,
} from './dto/update-data-value.dto';
import { modelToDto } from './dto/model.dto';
import {
  AddDataValueDto,
  AddDataValueDtoSchema,
} from './dto/add-data-value.dto';

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
    @Body() requestBody: CreateModelDto,
    @Request() req: AuthRequest,
  ) {
    const createModelDto = CreateModelDtoSchema.parse(requestBody);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const organization =
      await this.organizationService.findOneOrFail(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    const model = Model.create({
      name: createModelDto.name,
      description: createModelDto.description,
      user: req.authContext.user,
      organization,
    });
    model.createUniqueProductIdentifier();
    return modelToDto(await this.modelsService.save(model));
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
    const organization =
      await this.organizationService.findOneOrFail(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    return (await this.modelsService.findAllByOrganization(organizationId)).map(
      (m) => modelToDto(m),
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
    const organization =
      await this.organizationService.findOneOrFail(organizationId);
    await this.permissionsService.canAccessOrganizationOrFail(
      organization.id,
      req.authContext,
    );
    return modelToDto(model);
  }

  @Patch(':modelId')
  async update(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Body() requestBody: UpdateModelDto,
    @Request() req: AuthRequest,
  ) {
    const updateModelDto = UpdateModelDtoSchema.parse(requestBody);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOne(modelId);
    await this.organizationService.findOneOrFail(organizationId);

    if (updateModelDto.name) {
      model.rename(updateModelDto.name);
    }
    if (updateModelDto.description) {
      model.modifyDescription(updateModelDto.description);
    }

    return modelToDto(await this.modelsService.save(model));
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
      await this.productDataModelService.findOneOrFail(productDataModelId);
    const model = await this.modelsService.findOne(modelId);
    const organization =
      await this.organizationService.findOneOrFail(organizationId);
    await this.permissionsService.canAccessOrganizationOrFail(
      organization.id,
      req.authContext,
    );

    model.assignProductDataModel(productDataModel);
    return modelToDto(await this.modelsService.save(model));
  }

  @Patch(':modelId/data-values')
  async updateDataValues(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Body() requestBody: UpdateDataValueDto[],
    @Request() req: AuthRequest,
  ) {
    const updateDataValues =
      UpdateDataValueDtoSchema.array().parse(requestBody);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOne(modelId);
    const organization =
      await this.organizationService.findOneOrFail(organizationId);
    await this.permissionsService.canAccessOrganizationOrFail(
      organization.id,
      req.authContext,
    );

    model.modifyDataValues(updateDataValues);
    const productDataModel = await this.productDataModelService.findOneOrFail(
      model.productDataModelId,
    );
    const validationResult = productDataModel.validate(model.dataValues);
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return modelToDto(await this.modelsService.save(model));
  }

  @Post(':modelId/data-values')
  async addDataValues(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Body() requestBody: AddDataValueDto[],
    @Request() req: AuthRequest,
  ) {
    const addDataValues = AddDataValueDtoSchema.array().parse(requestBody);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOne(modelId);
    await this.organizationService.findOneOrFail(organizationId);
    model.addDataValues(addDataValues.map((d) => DataValue.create(d)));
    const productDataModel = await this.productDataModelService.findOneOrFail(
      model.productDataModelId,
    );
    const validationResult = productDataModel.validate(model.dataValues);
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return modelToDto(await this.modelsService.save(model));
  }
}
