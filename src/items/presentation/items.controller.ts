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
import { Item } from '../domain/item';
import { itemToDto } from './dto/item.dto';
import { PermissionsService } from '../../permissions/permissions.service';
import { DataValue } from '../../passport/domain/passport';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import {
  AddDataValueDto,
  AddDataValueDtoSchema,
  DataValueDto,
  DataValueDtoSchema,
} from '../../passport/presentation/dto/data-value.dto';
import { ModelsService } from '../../models/infrastructure/models.service';

@Controller('organizations/:orgaId/models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly permissionsService: PermissionsService,
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
    const item = Item.create({
      organizationId,
      userId: req.authContext.user.id,
    });
    const model = await this.modelsService.findOne(modelId);
    const productDataModel = model.productDataModelId
      ? await this.productDataModelService.findOneOrFail(
          model.productDataModelId,
        )
      : undefined;
    item.defineModel(model, productDataModel);
    item.createUniqueProductIdentifier();
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
    return itemToDto(await this.itemsService.findById(itemId));
  }

  @Post(':itemId/data-values')
  async addDataValues(
    @Param('orgaId') organizationId: string,
    @Param('itemId') itemId: string,
    @Body() requestBody: AddDataValueDto[],
    @Request() req: AuthRequest,
  ) {
    const addDataValues = AddDataValueDtoSchema.array().parse(requestBody);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const item = await this.itemsService.findById(itemId);
    if (item.ownedByOrganizationId !== organizationId) {
      throw new ForbiddenException();
    }
    item.addDataValues(addDataValues.map((d) => DataValue.create(d)));
    const productDataModel = await this.productDataModelService.findOneOrFail(
      item.productDataModelId,
    );
    const validationResult = productDataModel.validate(
      item.dataValues,
      GranularityLevel.MODEL,
    );
    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.toJson());
    }
    return itemToDto(await this.itemsService.save(item));
  }

  @Patch(':itemId/data-values')
  async updateDataValues(
    @Param('orgaId') organizationId: string,
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
    if (item.ownedByOrganizationId !== organizationId) {
      throw new ForbiddenException();
    }

    item.modifyDataValues(updateDataValues.map((d) => DataValue.create(d)));
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
