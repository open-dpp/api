import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { ItemsService } from '../infrastructure/items.service';
import { Item } from '../domain/item';
import { ModelsService } from '../../models/infrastructure/models.service';
import { GetItemDto } from './dto/get.item.dto';
import { plainToInstance } from 'class-transformer';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { PermissionsService } from '../../permissions/permissions.service';

@Controller('organizations/:orgaId/models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly organizationsService: OrganizationsService,
    private readonly modelsService: ModelsService,
    private readonly permissionsService: PermissionsService,
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
    const item = new Item();
    item.defineModel(modelId);
    item.createUniqueProductIdentifier();
    return this.itemToDto(await this.itemsService.save(item, req.authContext));
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
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
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
}
