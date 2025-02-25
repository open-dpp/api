import { Module } from '@nestjs/common';
import { UniqueProductIdentifierService } from './infrastructure/unique.product.identifier.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniqueProductIdentifierEntity } from './infrastructure/unique.product.identifier.entity';
import { UniqueProductIdentifierController } from './presentation/unique.product.identifier.controller';
import { ModelsService } from '../models/infrastructure/models.service';
import { ModelEntity } from '../models/infrastructure/model.entity';
import { ProductDataModelService } from '../product-data-model/infrastructure/product.data.model.service';
import { ProductDataModelEntity } from '../product-data-model/infrastructure/product.data.model.entity';
import { UsersModule } from '../users/users.module';
import { ItemsService } from '../items/infrastructure/items.service';
import { ItemEntity } from '../items/infrastructure/item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UniqueProductIdentifierEntity,
      ModelEntity,
      ProductDataModelEntity,
      ItemEntity,
    ]),
    UsersModule,
  ],
  controllers: [UniqueProductIdentifierController],
  providers: [
    UniqueProductIdentifierService,
    ModelsService,
    ProductDataModelService,
    ItemsService,
  ],
  exports: [UniqueProductIdentifierService],
})
export class UniqueProductIdentifierModule {}
