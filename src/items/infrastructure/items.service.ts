import { Injectable } from '@nestjs/common';
import { Item } from '../domain/item';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model as MongooseModel } from 'mongoose';
import { ItemDoc, ItemDocSchemaVersion } from './item.schema';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(ItemDoc.name)
    private itemDoc: MongooseModel<ItemDoc>,
    private uniqueModelIdentifierService: UniqueProductIdentifierService,
  ) {}

  convertToDomain(
    itemDoc: ItemDoc,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    const item = new Item(itemDoc.id, uniqueProductIdentifiers);
    item.defineModel(itemDoc.modelId);
    return item;
  }

  async save(item: Item) {
    const itemEntity = await this.itemDoc.findOneAndUpdate(
      { _id: item.id },
      {
        _schemaVersion: ItemDocSchemaVersion.v1_0_0,
        modelId: item.model,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none found
        runValidators: true,
      },
    );
    for (const uniqueProductIdentifier of item.uniqueProductIdentifiers) {
      await this.uniqueModelIdentifierService.save(uniqueProductIdentifier);
    }
    return this.convertToDomain(itemEntity, item.uniqueProductIdentifiers);
  }

  async findById(id: string) {
    const itemDoc = await this.itemDoc.findById(id);
    if (!itemDoc) {
      throw new NotFoundInDatabaseException(Item.name);
    }
    return this.convertToDomain(
      itemDoc,
      await this.uniqueModelIdentifierService.findAllByReferencedId(itemDoc.id),
    );
  }

  async findAllByModel(modelId: string) {
    const itemDocs = await this.itemDoc.find({
      modelId: modelId,
    });
    return await Promise.all(
      itemDocs.map(async (idocs) =>
        this.convertToDomain(
          idocs,
          await this.uniqueModelIdentifierService.findAllByReferencedId(
            idocs.id,
          ),
        ),
      ),
    );
  }
}
