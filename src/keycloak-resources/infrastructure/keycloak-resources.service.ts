import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AuthContext } from '../../auth/auth-request';

@Injectable()
export class KeycloakResourcesService {
  private readonly logger = new Logger(KeycloakResourcesService.name);

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
}
