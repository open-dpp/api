import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from './item.entity';
import { Item } from '../domain/item';
import { ProductEntity } from '../../products/infrastructure/product.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemEntity)
    private itemsRepository: Repository<ItemEntity>,
    @InjectRepository(ProductEntity)
    private productsRepository: Repository<ProductEntity>,
  ) {}

  convertToDomain(itemEntity: ItemEntity) {
    const item = new Item(itemEntity.id);
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
    return this.convertToDomain(itemEntity);
  }

  async findById(id: string) {
    return this.convertToDomain(
      await this.itemsRepository.findOne({ where: { id } }),
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
    return itemEntities.map((ie) => this.convertToDomain(ie));
  }
}
