import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ModelsSQLService } from './models.sql.service';
import { ModelsService } from './models.service';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

@Injectable()
export class ModelsMigrationService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(ModelsMigrationService.name);

  constructor(
    private modelsSQLService: ModelsSQLService,
    private modelsService: ModelsService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Migrating models to mongo');
    const models = await this.modelsSQLService.findAll();
    for (const model of models) {
      try {
        await this.modelsService.findOne(model.id);
      } catch (exception) {
        if (exception instanceof NotFoundInDatabaseException) {
          this.logger.log('Migrating model ' + model.id);
          await this.modelsService.save(model);
        } else {
          throw exception;
        }
      }
    }
    this.logger.log('Finished migrating models to mongo');
  }
}
