import { Module } from '@nestjs/common';
import { TemplateDraftController } from './presentation/template-draft.controller';
import { ProductDataModelService } from '../product-data-model/infrastructure/product-data-model.service';
import { TemplateDraftService } from './infrastructure/template-draft.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TemplateDraftDoc,
  TemplateDraftSchema,
} from './infrastructure/template-draft.schema';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TemplateDraftDoc.name,
        schema: TemplateDraftSchema,
      },
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    MarketplaceModule,
    PermissionsModule,
  ],
  controllers: [TemplateDraftController],
  providers: [ProductDataModelService, TemplateDraftService],
  exports: [TemplateDraftService],
})
export class TemplateDraftModule {}
