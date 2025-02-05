import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AuthContext } from '../../auth/auth-request';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakResourcesService {
  private readonly logger = new Logger(KeycloakResourcesService.name);
  private readonly kcAdminClient = new KcAdminClient({
    baseUrl: this.configService.get('KEYCLOAK_NETWORK_URL'),
  });

  constructor(
    private reflector: Reflector,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async createResource(
    authContext: AuthContext,
    resourceName: string,
    uris: string[],
  ) {
    const url = `${this.configService.get('KEYCLOAK_NETWORK_URL')}/realms/${this.configService.get('KEYCLOAK_REALM')}/authz/protection/resource_set`;

    // const keycloakId = null;
    try {
      const data = {
        name: resourceName,
        type: `urn:backend:${resourceName}`,
        ownerManagedAccess: true,
        attributes: {
          owner: authContext.user.id,
        },
        uris: uris,
        scopes: [
          {
            name: 'read',
          },
        ],
      };
      const response = await firstValueFrom(
        this.httpService.post<any>(url, data, {
          headers: {
            authorization: `Bearer ${authContext.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(response.data);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async createGroup(authContext: AuthContext, groupName: string) {
    await this.kcAdminClient.auth({
      grantType: 'password',
      clientId: 'admin-cli',
      username: 'admin',
      password: 'admin',
    });
    await this.kcAdminClient.groups.create({
      name: groupName,
      realm: 'open-dpp',
    });
    await this.kcAdminClient.users.addToGroup({
      id: authContext.user.id,
      groupId: groupName,
    });
  }
}
