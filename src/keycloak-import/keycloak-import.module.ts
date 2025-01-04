import { Module } from '@nestjs/common';
import { KeycloakImportService } from './keycloak-import/keycloak-import.service';

@Module({
  providers: [KeycloakImportService],
})
export class KeycloakImportModule {}
