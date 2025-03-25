import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProductDataModelService } from './product-data-model.service';
import { ProductDataModelOldService } from './product.data.model.old.service';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

@Injectable()
export class SqlToMongoMigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SqlToMongoMigrationService.name);

  constructor(
    private productDataModelOldService: ProductDataModelOldService,
    private productDataModelService: ProductDataModelService,
  ) {}

  async onApplicationBootstrap() {
    const found = await this.productDataModelOldService.findAll();
    for (const oldModel of found) {
      try {
        await this.productDataModelService.findOneOrFail(oldModel.id);
      } catch (err) {
        if (err instanceof NotFoundInDatabaseException) {
          await this.productDataModelService.save(oldModel);
          this.logger.log(`Migrated ${oldModel.id}`);
        } else {
          throw err;
        }
      }
    }
  }
}
