import { Module } from '@nestjs/common';
import { ProductDataModelDraftController } from './presentation/product-data-model-draft.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
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
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [ProductDataModelDraftController],
  providers: [ProductDataModelService, ProductDataModelDraftService],
  exports: [ProductDataModelDraftService],
})
export class ProductDataModelDraftModule {}
