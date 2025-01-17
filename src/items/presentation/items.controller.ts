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
import { ProductsService } from '../../products/infrastructure/products.service';
import { GetItemDto } from './dto/get.item.dto';
import { plainToInstance } from 'class-transformer';
import { defineAbilityFor } from '../../auth/abilities/item.ability';

@Controller('models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  async create(@Param('modelId') modelId: string, @Request() req: AuthRequest) {
    const model = await this.productsService.findOne(modelId);
    const item = new Item();
    item.defineModel({ modelId: model.id, modelOwner: model.owner });
    const ability = defineAbilityFor(req.authContext.user);
    if (ability.can('create', item)) {
      return this.itemToDto(await this.itemsService.save(item));
    } else {
      throw new ForbiddenException();
    }
  }

  @Get()
  async getAll(@Param('modelId') modelId: string, @Request() req: AuthRequest) {
    const items = await this.itemsService.findAllByModel(modelId);
    const ability = defineAbilityFor(req.authContext.user);

    return items.map((item) => {
      if (ability.can('readAll', item)) {
        return this.itemToDto(item);
      } else {
        throw new ForbiddenException();
      }
    });
  }

  @Get(':id')
  async get(
    @Param('modelId') modelId: string,
    @Param('id') itemId: string,
    @Request() req: AuthRequest,
  ) {
    await this.checkPermission(req, modelId);
    return this.itemToDto(await this.itemsService.findById(itemId));
  }

  private itemToDto(item: Item) {
    return plainToInstance(GetItemDto, { id: item.id });
  }

  private async checkPermission(req: AuthRequest, modelId: string) {
    const model = await this.productsService.findOne(modelId);
    if (!model.isOwnedBy(req.authContext.user)) {
      throw new ForbiddenException();
    }
  }
}
