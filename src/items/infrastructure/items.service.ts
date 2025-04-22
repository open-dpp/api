import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { ItemEntity } from './item.entity';
import { Item } from '../domain/item';
import { ModelEntity } from '../../models/infrastructure/model.entity';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Model } from '../../models/domain/model';
import { DppEventsService } from '../../dpp-events/infrastructure/dpp-events.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemEntity)
    private itemsRepository: Repository<ItemEntity>,
    @InjectRepository(ModelEntity)
    private modelRepository: Repository<ModelEntity>,
    private uniqueModelIdentifierService: UniqueProductIdentifierService,
    private readonly dppEventsService: DppEventsService,
  ) {}

  convertToDomain(
    itemEntity: ItemEntity,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    const item = new Item(itemEntity.id, uniqueProductIdentifiers);
    item.defineModel(itemEntity.modelId);
    return item;
  }

  async save(item: Item) {
    const modelEntity = await this.modelRepository.findOne({
      where: { id: Equal(item.model) },
    });
    if (!modelEntity) {
      throw new NotFoundInDatabaseException(Model.name);
    }
    const itemEntity = await this.itemsRepository.save({
      id: item.id,
      model: modelEntity,
    });
    for (const uniqueProductIdentifier of item.uniqueProductIdentifiers) {
      await this.uniqueModelIdentifierService.save(uniqueProductIdentifier);
    }
    return this.convertToDomain(itemEntity, item.uniqueProductIdentifiers);
  }

  async findById(id: string) {
    const itemEntity = await this.itemsRepository.findOne({
      where: { id: Equal(id) },
    });
    if (!itemEntity) {
      throw new NotFoundInDatabaseException(Item.name);
    }
    return this.convertToDomain(
      itemEntity,
      await this.uniqueModelIdentifierService.findAllByReferencedId(
        itemEntity.id,
      ),
    );
  }

  async findAllByModel(modelId: string) {
    const itemEntities = await this.itemsRepository.find({
      where: {
        model: {
          id: Equal(modelId),
        },
      },
    });
    return await Promise.all(
      itemEntities.map(async (ie) =>
        this.convertToDomain(
          ie,
          await this.uniqueModelIdentifierService.findAllByReferencedId(ie.id),
        ),
      ),
    );
  }
}
