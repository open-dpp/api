import { Module } from '@nestjs/common';
import { KeycloakImportService } from './keycloak-import/keycloak-import.service';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PermalinksModule } from '../permalinks/permalinks.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [UsersModule, OrganizationsModule, PermalinksModule, ProductsModule],
  providers: [KeycloakImportService],
})
export class KeycloakImportModule {}
