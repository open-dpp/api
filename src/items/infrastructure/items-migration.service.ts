import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { ItemsService } from './items.service';
import { ItemsSQLService } from './items.sql.service';

@Injectable()
export class ItemsMigrationService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(ItemsMigrationService.name);

  constructor(
    private itemsSqlService: ItemsSQLService,
    private itemService: ItemsService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Migrating items to mongo');
    const items = await this.itemsSqlService.findAll();
    for (const item of items) {
      try {
        await this.itemService.findById(item.id);
      } catch (exception) {
        if (exception instanceof NotFoundInDatabaseException) {
          this.logger.log('Migrating item ' + item.id);
          await this.itemService.save(item);
        } else {
          throw exception;
        }
      }
    }

    this.logger.log('Finished migrating items to mongo');
  }
}
