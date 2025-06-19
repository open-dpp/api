import { Module } from '@nestjs/common';
import { UniqueProductIdentifierController } from './presentation/unique.product.identifier.controller';
import { ModelsService } from '../models/infrastructure/models.service';
import { ProductDataModelService } from '../product-data-model/infrastructure/product-data-model.service';
import { UsersModule } from '../users/users.module';
import { ItemsService } from '../items/infrastructure/items.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { TraceabilityEventsModule } from '../traceability-events/traceability-events.module';
import { ModelDoc, ModelSchema } from '../models/infrastructure/model.schema';
import { ItemDoc, ItemSchema } from '../items/infrastructure/item.schema';
import {
  UniqueProductIdentifierDoc,
  UniqueProductIdentifierSchema,
} from './infrastructure/unique-product-identifier.schema';
import { UniqueProductIdentifierService } from './infrastructure/unique-product-identifier.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UniqueProductIdentifierDoc.name,
        schema: UniqueProductIdentifierSchema,
      },
      {
        name: ItemDoc.name,
        schema: ItemSchema,
      },
      {
        name: ModelDoc.name,
        schema: ModelSchema,
      },
      {
        name: ProductDataModelDoc.name,
        schema: ProductDataModelSchema,
      },
    ]),
    OrganizationsModule,
    PermissionsModule,
    UsersModule,
    TraceabilityEventsModule,
  ],
  controllers: [UniqueProductIdentifierController],
  providers: [
    UniqueProductIdentifierService,
    ModelsService,
    ProductDataModelService,
    ItemsService,
  ],
  exports: [UniqueProductIdentifierService],
})
export class UniqueProductIdentifierModule {}
