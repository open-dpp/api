import { Module } from '@nestjs/common';
import { AasConnectionController } from './presentation/aas-connection.controller';
import { ModelsService } from '../models/infrastructure/models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { OrganizationEntity } from '../organizations/infrastructure/organization.entity';
import { ItemDoc, ItemSchema } from '../items/infrastructure/item.schema';
import { ModelDoc, ModelSchema } from '../models/infrastructure/model.schema';
import { ProductDataModelModule } from '../product-data-model/product.data.model.module';
import { ModelsModule } from '../models/models.module';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';
import {
  AasConnectionDoc,
  AasConnectionSchema,
} from './infrastructure/aas-connection.schema';
import { AasConnectionService } from './infrastructure/aas-connection.service';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ItemsService } from '../items/infrastructure/items.service';

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
      {
        name: AasConnectionDoc.name,
        schema: AasConnectionSchema,
      },
    ]),
    ProductDataModelModule,
    ModelsModule,
    UniqueProductIdentifierModule,
    OrganizationsModule,
    UsersModule,
    KeycloakResourcesModule,
    PermissionsModule,
  ],
  controllers: [AasConnectionController],
  providers: [ModelsService, ItemsService, AasConnectionService],
  exports: [],
})
export class IntegrationModule {}
