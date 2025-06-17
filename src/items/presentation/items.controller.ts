import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { ItemsService } from '../infrastructure/items.service';
import { Item } from '../domain/item';
import { GetItemDto } from './dto/get.item.dto';
import { plainToInstance } from 'class-transformer';
import { PermissionsService } from '../../permissions/permissions.service';
import { ItemCreatedEventData } from '../../traceability-events/modules/open-dpp/domain/open-dpp-events/item-created-event.data';
import { TraceabilityEventsService } from '../../traceability-events/infrastructure/traceability-events.service';
import { UniqueProductIdentifierCreatedEventData } from '../../traceability-events/modules/open-dpp/domain/open-dpp-events/unique-product-identifier-created-event.data';

@Controller('organizations/:orgaId/models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly permissionsService: PermissionsService,
    private readonly traceabilityEventsService: TraceabilityEventsService,
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
    const itemDto = this.itemToDto(await this.itemsService.save(item));
    await this.traceabilityEventsService.create(
      ItemCreatedEventData.createWithWrapper({
        itemId: item.id,
        userId: req.authContext.user.id,
        organizationId: organizationId,
      }),
      req.authContext,
    );
    for (const uniqueProductIdentifier of item.uniqueProductIdentifiers) {
      await this.traceabilityEventsService.create(
        UniqueProductIdentifierCreatedEventData.createWithWrapper({
          itemId: item.id,
          userId: req.authContext.user.id,
          organizationId: organizationId,
          uniqueProductIdentifierId: uniqueProductIdentifier.uuid,
        }),
        req.authContext,
      );
    }
    return itemDto;
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
        referenceId: u.referenceId,
      })),
    });
  }
}
