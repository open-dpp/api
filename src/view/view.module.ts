import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { getViewSchema, ViewDoc } from './infrastructure/view.schema';
import { ViewService } from './infrastructure/view.service';
import { ViewImportService } from './infrastructure/view-import.service';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from '../product-data-model-draft/infrastructure/product-data-model-draft.schema';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { ProductDataModelService } from '../product-data-model/infrastructure/product-data-model.service';
import { ProductDataModelDraftService } from '../product-data-model-draft/infrastructure/product-data-model-draft.service';

// TODO: Delete after running import service
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
  ],

  providers: [
    ProductDataModelService,
    ProductDataModelDraftService,
    ViewService,
    ViewImportService,
  ],
})
export class ViewModule {}
