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
import { AuthRequest } from '../../auth/auth-request';
import { ItemsService } from '../infrastructure/items.service';
import { itemToDto } from './dto/item.dto';
import { PermissionsService } from '../../permissions/permissions.service';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import {
  DataValueDto,
  DataValueDtoSchema,
} from '../../product-passport/presentation/dto/data-value.dto';
import { ModelsService } from '../../models/infrastructure/models.service';
import { DataValue } from '../../product-passport/domain/data-value';
import { ItemsApplicationService } from './items-application.service';

@Controller('organizations/:orgaId/models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly permissionsService: PermissionsService,
    private readonly itemsApplicationService: ItemsApplicationService,
    private readonly modelsService: ModelsService,
    private readonly productDataModelService: ProductDataModelService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const item = await this.itemsApplicationService.createItem(
      organizationId,
      modelId,
      req.authContext.user.id,
    );
    return itemToDto(await this.itemsService.save(item));
  }

  @Get()
  async getAll(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOneOrFail(modelId);
    if (!model.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
    return (await this.itemsService.findAllByModel(modelId)).map((item) =>
      itemToDto(item),
    );
  }

  @Get(':id')
  async get(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Param('id') itemId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const item = await this.itemsService.findById(itemId);
    if (!item.isOwnedBy(organizationId) || item.modelId !== modelId) {
      throw new ForbiddenException();
    }
    return itemToDto(item);
  }

  @Post(':itemId/data-values')
  async addDataValues(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Param('itemId') itemId: string,
    @Body() requestBody: DataValueDto[],
    @Request() req: AuthRequest,
  ) {
    const addDataValues = DataValueDtoSchema.array().parse(requestBody);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const item = await this.itemsService.findById(itemId);
    if (!item.isOwnedBy(organizationId) || item.modelId !== modelId) {
      throw new ForbiddenException();
    }
    item.addDataValues(addDataValues.map((d) => DataValue.create(d)));
    if (!item.productDataModelId) {
      throw new BadRequestException(
        'Item does not have a product data model assigned',
      );
    }
    const productDataModel = await this.productDataModelService.findOneOrFail(
      item.productDataModelId,
    );

    const validationResult = productDataModel.validate(
      item.dataValues,
      GranularityLevel.ITEM,
    );
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return itemToDto(await this.itemsService.save(item));
  }

  @Patch(':itemId/data-values')
  async updateDataValues(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Param('itemId') itemId: string,
    @Body() requestBody: DataValueDto[],
    @Request() req: AuthRequest,
  ) {
    const updateDataValues = DataValueDtoSchema.array().parse(requestBody);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const item = await this.itemsService.findById(itemId);
    if (!item.isOwnedBy(organizationId) || item.modelId !== modelId) {
      throw new ForbiddenException();
    }

    item.modifyDataValues(updateDataValues.map((d) => DataValue.create(d)));
    if (!item.productDataModelId) {
      throw new BadRequestException(
        'Item does not have a product data model assigned',
      );
    }
    const productDataModel = await this.productDataModelService.findOneOrFail(
      item.productDataModelId,
    );

    const validationResult = productDataModel.validate(
      item.dataValues,
      GranularityLevel.ITEM,
    );
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return itemToDto(await this.itemsService.save(item));
  }
}
