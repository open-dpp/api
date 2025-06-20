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
    private uniqueProductIdentifierService: UniqueProductIdentifierService,
  ) {}

  convertToDomain(
    itemDoc: ItemDoc,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
  ) {
    return Item.loadFromDb({
      id: itemDoc.id,
      uniqueProductIdentifiers,
      organizationId: itemDoc.ownedByOrganizationId,
      userId: itemDoc.createdByUserId,
      modelId: itemDoc.modelId,
      dataValues: itemDoc.dataValues
        ? itemDoc.dataValues.map((dv) => ({
            value: dv.value ?? undefined,
            dataSectionId: dv.dataSectionId,
            dataFieldId: dv.dataFieldId,
            row: dv.row,
          }))
        : [],
      productDataModelId: itemDoc.productDataModelId,
    });
  }

  async save(item: Item) {
    const itemEntity = await this.itemDoc.findOneAndUpdate(
      { _id: item.id },
      {
        _schemaVersion: ItemDocSchemaVersion.v1_0_1,
        modelId: item.modelId,
        productDataModelId: item.productDataModelId,
        ownedByOrganizationId: item.ownedByOrganizationId,
        createdByUserId: item.createdByUserId,
        dataValues: item.dataValues.map((d) => ({
          value: d.value,
          dataSectionId: d.dataSectionId,
          dataFieldId: d.dataFieldId,
          row: d.row,
        })),
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none found
        runValidators: true,
      },
    );
    for (const uniqueProductIdentifier of item.uniqueProductIdentifiers) {
      await this.uniqueProductIdentifierService.save(uniqueProductIdentifier);
    }
    return this.convertToDomain(itemEntity, item.uniqueProductIdentifiers);
  }

  async findOneOrFail(id: string): Promise<Item> {
    const item = await this.findOne(id);
    if (!item) {
      throw new NotFoundInDatabaseException(Item.name);
    }
    return item;
  }

  async findOne(id: string): Promise<Item | undefined> {
    const itemDoc = await this.itemDoc.findById(id);
    if (!itemDoc) {
      return undefined;
    }
    return this.convertToDomain(
      itemDoc,
      await this.uniqueProductIdentifierService.findAllByReferencedId(
        itemDoc.id,
      ),
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
          await this.uniqueProductIdentifierService.findAllByReferencedId(
            idocs.id,
          ),
        ),
      ),
    );
  }
}
