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

@Controller('models/:modelId/items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly modelsService: ModelsService,
  ) {}

  @Post()
  async create(@Param('modelId') modelId: string, @Request() req: AuthRequest) {
    await this.checkPermission(req, modelId);
    const item = new Item();
    item.defineModel(modelId);
    item.createUniqueProductIdentifier();
    return this.itemToDto(await this.itemsService.save(item));
  }

  @Get()
  async getAll(@Param('modelId') modelId: string, @Request() req: AuthRequest) {
    await this.checkPermission(req, modelId);
    return (await this.itemsService.findAllByModel(modelId)).map((item) =>
      this.itemToDto(item),
    );
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
    return plainToInstance(GetItemDto, {
      id: item.id,
      uniqueProductIdentifiers: item.uniqueProductIdentifiers,
    });
  }

  private async checkPermission(req: AuthRequest, modelId: string) {
    const model = await this.modelsService.findOne(modelId);
    if (!model.isOwnedBy(req.authContext.user)) {
      throw new ForbiddenException();
    }
  }
}
