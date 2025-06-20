import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelsModule } from '../models/models.module';
import { ItemsController } from './presentation/items.controller';
import { ItemsService } from './infrastructure/items.service';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';
import { OrganizationsService } from '../organizations/infrastructure/organizations.service';
import { OrganizationEntity } from '../organizations/infrastructure/organization.entity';
import { UsersModule } from '../users/users.module';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { TraceabilityEventsModule } from '../traceability-events/traceability-events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelDoc, ModelSchema } from '../models/infrastructure/model.schema';
import { ItemDoc, ItemSchema } from './infrastructure/item.schema';
import { ProductDataModelModule } from '../product-data-model/product.data.model.module';
import { ItemsApplicationService } from './presentation/items-application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity]),
    MongooseModule.forFeature([
      {
        name: ItemDoc.name,
        schema: ItemSchema,
      },
      {
        name: ModelDoc.name,
        schema: ModelSchema,
      },
    ]),
    ProductDataModelModule,
    ModelsModule,
    UniqueProductIdentifierModule,
    UsersModule,
    KeycloakResourcesModule,
    PermissionsModule,
    TraceabilityEventsModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService, ItemsApplicationService, OrganizationsService],
  exports: [ItemsService],
})
export class ItemsModule {}
