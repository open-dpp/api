import { Module } from '@nestjs/common';
import { ModelsService } from './infrastructure/models.service';
import { ModelsController } from './presentation/models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './infrastructure/model.entity';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';
import { DataValueEntity } from './infrastructure/data.value.entity';
import { ProductDataModelModule } from '../product-data-model/product.data.model.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelEntity, DataValueEntity]),
    MongooseModule.forFeature([
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    ProductDataModelModule,
    OrganizationsModule,
    UniqueProductIdentifierModule,
    UsersModule,
    PermissionsModule,
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
