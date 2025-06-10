import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
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
} from '../../passport/presentation/dto/data-value.dto';

@Controller('organizations/:orgaId/models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly permissionsService: PermissionsService,
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
    item.defineModel(modelId);
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
}
