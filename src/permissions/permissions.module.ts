import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';

@Module({
  imports: [KeycloakResourcesModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
