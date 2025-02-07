import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from '../models/infrastructure/model.entity';
import { ItemEntity } from './infrastructure/item.entity';
import { ModelsModule } from '../models/models.module';
import { ItemsController } from './presentation/items.controller';
import { ItemsService } from './infrastructure/items.service';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelEntity, ItemEntity]),
    ModelsModule,
    UniqueProductIdentifierModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
