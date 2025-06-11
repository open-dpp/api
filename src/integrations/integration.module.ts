import { Module } from '@nestjs/common';
import { AasMappingController } from './presentation/aas-mapping.controller';
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
  AasMappingDoc,
  AasMappingSchema,
} from './infrastructure/aas-mapping.schema';
import { AasMappingService } from './infrastructure/aas-mapping.service';

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
        name: AasMappingDoc.name,
        schema: AasMappingSchema,
      },
    ]),
    ProductDataModelModule,
    ModelsModule,
    UniqueProductIdentifierModule,
    UsersModule,
    KeycloakResourcesModule,
    PermissionsModule,
  ],
  controllers: [AasMappingController],
  providers: [ModelsService, AasMappingService],
  exports: [],
})
export class IntegrationModule {}
