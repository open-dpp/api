import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from './item.entity';
import { Item } from '../domain/item';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { UniqueProductIdentifierSqlService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.sql.service';

@Injectable()
export class ItemsSQLService {
  constructor(
    @InjectRepository(ItemEntity)
    private itemsRepository: Repository<ItemEntity>,
    private uniqueModelIdentifierService: UniqueProductIdentifierSqlService,
  ) {}

  convertToDomain(
    itemEntity: ItemEntity,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    const item = new Item(itemEntity.id, uniqueProductIdentifiers);
    item.defineModel(itemEntity.modelId);
    return item;
  }

  async findAll() {
    const itemEntities = await this.itemsRepository.find();
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
