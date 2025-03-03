import {
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
import { ModelsService } from '../../models/infrastructure/models.service';
import { GetItemDto } from './dto/get.item.dto';
import { plainToInstance } from 'class-transformer';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';

@Controller('organizations/:orgaId/models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly organizationsService: OrganizationsService,
    private readonly modelsService: ModelsService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Request() req: AuthRequest,
  ) {
    await this.hasPermissionOrFail(organizationId, modelId, req);
    const item = new Item();
    item.defineModel(modelId);
    item.createUniqueProductIdentifier();
    return this.itemToDto(await this.itemsService.save(item));
  }

  @Get()
  async getAll(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Request() req: AuthRequest,
  ) {
    await this.hasPermissionOrFail(organizationId, modelId, req);
    return (await this.itemsService.findAllByModel(modelId)).map((item) =>
      this.itemToDto(item),
    );
  }

  @Get(':id')
  async get(
    @Param('orgaId') organizationId: string,
    @Param('modelId') modelId: string,
    @Param('id') itemId: string,
    @Request() req: AuthRequest,
  ) {
    await this.hasPermissionOrFail(organizationId, modelId, req);
    return this.itemToDto(await this.itemsService.findById(itemId));
  }

  private itemToDto(item: Item) {
    return plainToInstance(GetItemDto, {
      id: item.id,
      uniqueProductIdentifiers: item.uniqueProductIdentifiers.map((u) => ({
        uuid: u.uuid,
        view: u.view,
        referenceId: u.referenceId,
      })),
    });
  }

  private async hasPermissionOrFail(
    organizationId: string,
    modelId: string,
    req: AuthRequest,
  ) {
    const organization =
      await this.organizationsService.findOne(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    const model = await this.modelsService.findOne(modelId);
    if (!model.isOwnedBy(organization)) {
      throw new ForbiddenException();
    }
  }
}
