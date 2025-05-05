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
import { MigrationV100ToV101Service } from './migration-v-1-0-0-to-v-1-0-1.service';

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
    PermissionsModule,
  ],
  controllers: [ProductDataModelDraftController],
  providers: [
    ProductDataModelService,
    ProductDataModelDraftService,
    MigrationV100ToV101Service, // TODO: Delete after running migration service
  ],
  exports: [ProductDataModelDraftService],
})
export class ProductDataModelDraftModule {}
