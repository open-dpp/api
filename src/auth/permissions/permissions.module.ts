import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakPermissionsGuard } from './keycloak-permissions.guard';
import { KeycloakResourcesModule } from '../../keycloak-resources/keycloak-resources.module';

@Module({
  imports: [KeycloakResourcesModule],
  providers: [
    PermissionsService,
    {
      provide: APP_GUARD,
      useClass: KeycloakPermissionsGuard,
    },
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
