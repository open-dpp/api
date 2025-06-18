import { Module } from '@nestjs/common';
import { ModelsService } from './infrastructure/models.service';
import { ModelsController } from './presentation/models.controller';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';
import { ProductDataModelModule } from '../product-data-model/product.data.model.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { TraceabilityEventsModule } from '../traceability-events/traceability-events.module';
import { ModelDoc, ModelSchema } from './infrastructure/model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelDoc.name,
        schema: ModelSchema,
      },
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
    TraceabilityEventsModule,
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
