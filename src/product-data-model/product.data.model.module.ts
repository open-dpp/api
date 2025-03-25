import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDataModelEntity } from './infrastructure/product.data.model.entity';
import { ProductDataModelController } from './presentation/product.data.model.controller';
import { ProductDataModelService } from './infrastructure/product-data-model.service';
import { DataFieldEntity } from './infrastructure/data.field.entity';
import { DataSectionEntity } from './infrastructure/data.section.entity';
import { ProductDataModelImportService } from './infrastructure/product-data-model-import.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from './infrastructure/product-data-model.schema';
import { SqlToMongoMigrationService } from './infrastructure/sql-to-mongo-migration.service';
import { ProductDataModelOldService } from './infrastructure/product.data.model.old.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductDataModelEntity,
      DataSectionEntity,
      DataFieldEntity,
    ]),
    MongooseModule.forFeature([
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [ProductDataModelController],
  providers: [
    ProductDataModelService,
    ProductDataModelOldService,
    ProductDataModelImportService,
    SqlToMongoMigrationService,
  ],
  exports: [ProductDataModelService],
})
export class ProductDataModelModule {}
