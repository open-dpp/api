import { Module } from '@nestjs/common';
import { ModelsService } from './infrastructure/models.service';
import { ModelsController } from './presentation/models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './infrastructure/model.entity';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';
import { DataValueEntity } from './infrastructure/data.value.entity';
import { ProductDataModelModule } from '../product-data-model/product.data.model.module';
import { ProductDataModelEntity } from '../product-data-model/infrastructure/product.data.model.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModelEntity,
      DataValueEntity,
      ProductDataModelEntity,
    ]),
    ProductDataModelModule,
    UniqueProductIdentifierModule,
    UsersModule,
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
