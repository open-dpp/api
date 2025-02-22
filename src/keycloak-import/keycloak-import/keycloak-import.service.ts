import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakImportService implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigService) {}

  async onApplicationBootstrap() {
    const authClient = new KcAdminClient({
      baseUrl: this.configService.get('KEYCLOAK_NETWORK_URL'),
      realmName: this.configService.get('KEYCLOAK_ADMIN_REALM'),
    });

    await authClient.auth({
      username: this.configService.get('KEYCLOAK_ADMIN_USERNAME'),
      password: this.configService.get('KEYCLOAK_ADMIN_PASSWORD'),
      clientId: this.configService.get('KEYCLOAK_ADMIN_CLIENT'),
      grantType: 'password',
    });

    authClient.setConfig({
      realmName: this.configService.get('KEYCLOAK_REALM'),
    });
  }
}
