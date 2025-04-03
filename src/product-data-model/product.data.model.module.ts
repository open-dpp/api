import { Module } from '@nestjs/common';
import { ProductDataModelController } from './presentation/product.data.model.controller';
import { ProductDataModelService } from './infrastructure/product-data-model.service';
import { ProductDataModelImportService } from './infrastructure/product-data-model-import.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from './infrastructure/product-data-model.schema';

@Module({
  imports: [
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
  providers: [ProductDataModelService, ProductDataModelImportService],
  exports: [ProductDataModelService],
})
export class ProductDataModelModule {}
