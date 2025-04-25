import { Module } from '@nestjs/common';
import { ProductDataModelDraftController } from './presentation/product-data-model-draft.controller';
import { ProductDataModelService } from '../product-data-model/infrastructure/product-data-model.service';
import { ProductDataModelDraftService } from './infrastructure/product-data-model-draft.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from './infrastructure/product-data-model-draft.schema';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { getViewSchema, ViewDoc } from '../view/infrastructure/view.schema';
import { ViewService } from '../view/infrastructure/view.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductDataModelDraftDoc.name,
        schema: ProductDataModelDraftSchema,
      },
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
    PermissionsModule,
  ],
  controllers: [ProductDataModelDraftController],
  providers: [
    ProductDataModelService,
    ProductDataModelDraftService,
    ViewService,
  ],
  exports: [ProductDataModelDraftService],
})
export class ProductDataModelDraftModule {}
