import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from '../models/infrastructure/model.entity';
import { ItemEntity } from './infrastructure/item.entity';
import { ModelsModule } from '../models/models.module';
import { ItemsController } from './presentation/items.controller';
import { ItemsService } from './infrastructure/items.service';
import { UniqueProductIdentifierModule } from '../unique-product-identifier/unique.product.identifier.module';
import { OrganizationsService } from '../organizations/infrastructure/organizations.service';
import { OrganizationEntity } from '../organizations/infrastructure/organization.entity';
import { UsersModule } from '../users/users.module';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModelEntity, ItemEntity, OrganizationEntity]),
    ModelsModule,
    UniqueProductIdentifierModule,
    UsersModule,
    KeycloakResourcesModule,
    PermissionsModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService, OrganizationsService],
  exports: [ItemsService],
})
export class ItemsModule {}
