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
import { getViewSchema, ViewDoc } from '../view/infrastructure/view.schema';
import { ViewService } from '../view/infrastructure/view.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ViewDoc.name,
        useFactory: () => getViewSchema(),
      },
    ]),
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [ProductDataModelController],
  providers: [
    ProductDataModelService,
    ProductDataModelImportService,
    ViewService,
  ],
  exports: [ProductDataModelService],
})
export class ProductDataModelModule {}
