import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ModelsService } from '../../models/infrastructure/models.service';
import { InjectModel } from '@nestjs/mongoose';
import { ItemDoc } from './item.schema';
import { Model as MongooseModel } from 'mongoose';
import { Item } from '../domain/item';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';

@Injectable()
export class ItemOrgaUserMigrationService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(
    ItemOrgaUserMigrationService.name,
  );

  constructor(
    @InjectModel(ItemDoc.name)
    private itemDoc: MongooseModel<ItemDoc>,
    private readonly itemsService: ItemsService,
    private readonly uniqueModelIdentifierService: UniqueProductIdentifierService,
    private readonly modelsService: ModelsService,
    private readonly productDataModelService: ProductDataModelService,
  ) {}

  async onApplicationBootstrap() {
    const items = await this.itemDoc.find({
      ownedByOrganizationId: { $exists: false },
    });
    this.logger.log('Migrating items');
    for (const itemDoc of items) {
      this.logger.log(`Migrating item ${itemDoc.id}`);
      const modelId = itemDoc.modelId;
      if (modelId) {
        try {
          const model = await this.modelsService.findOne(modelId);
          const item = Item.loadFromDb({
            id: itemDoc.id,
            uniqueProductIdentifiers:
              await this.uniqueModelIdentifierService.findAllByReferencedId(
                itemDoc.id,
              ),
            organizationId: model.ownedByOrganizationId,
            userId: model.createdByUserId,
            modelId: itemDoc.modelId,
            dataValues: [],
            productDataModelId: undefined,
          });
          const productDataModel =
            await this.productDataModelService.findOneOrFail(
              model.productDataModelId,
            );

          item.assignProductDataModel(productDataModel);
          await this.itemsService.save(item);
        } catch (error) {
          this.logger.error(
            `Error migrating item ${itemDoc.id}: ${error.message}`,
          );
        }
      }
    }
  }
}
