import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from './item.entity';
import { Item } from '../domain/item';
import { ProductEntity } from '../../products/infrastructure/product.entity';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemEntity)
    private itemsRepository: Repository<ItemEntity>,
    @InjectRepository(ProductEntity)
    private productsRepository: Repository<ProductEntity>,
    private uniqueProductIdentifierService: UniqueProductIdentifierService,
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
    const modelEntity = await this.productsRepository.findOne({
      where: { id: item.model },
    });
    const itemEntity = await this.itemsRepository.save({
      id: item.id,
      model: modelEntity,
    });
    for (const uniqueProductIdentifier of item.uniqueProductIdentifiers) {
      await this.uniqueProductIdentifierService.save(uniqueProductIdentifier);
    }
    return this.convertToDomain(itemEntity, item.uniqueProductIdentifiers);
  }

  async findById(id: string) {
    const itemEntity = await this.itemsRepository.findOne({ where: { id } });
    return this.convertToDomain(
      itemEntity,
      await this.uniqueProductIdentifierService.findAllByReferencedId(
        itemEntity.id,
      ),
    );
  }

  async findAllByModel(modelId: string) {
    const itemEntities = await this.itemsRepository.find({
      where: {
        model: {
          id: modelId,
        },
      },
    });
    return await Promise.all(
      itemEntities.map(async (ie) =>
        this.convertToDomain(
          ie,
          await this.uniqueProductIdentifierService.findAllByReferencedId(
            ie.id,
          ),
        ),
      ),
    );
  }
}
