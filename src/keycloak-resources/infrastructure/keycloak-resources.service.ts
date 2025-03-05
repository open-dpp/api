import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthContext } from '../../auth/auth-request';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { HttpService } from '@nestjs/axios';
import { Organization } from '../../organizations/domain/organization';

@Injectable()
export class KeycloakResourcesService {
  private readonly logger = new Logger(KeycloakResourcesService.name);
  private readonly kcAdminClient = new KcAdminClient({
    baseUrl: this.configService.get('KEYCLOAK_NETWORK_URL'),
  });
  private readonly realm: string = this.configService.get('KEYCLOAK_REALM');

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async reloadToken() {
    await this.kcAdminClient.auth({
      grantType: 'password',
      clientId: 'admin-cli',
      username: this.configService.get('KEYCLOAK_ADMIN_USERNAME'),
      password: this.configService.get('KEYCLOAK_ADMIN_PASSWORD'),
    });
  }

  async createResource(
    authContext: AuthContext,
    resourceName: string,
    uris: string[],
  ) {
    await this.reloadToken();
    await this.kcAdminClient.clients.createResource(
      {
        id: 'backend',
        realm: this.realm,
      },
      {
        name: resourceName,
        type: `urn:backend:${resourceName}`,
        uris,
        ownerManagedAccess: true,
        attributes: {
          owner: [authContext.user.id],
        },
        scopes: [
          {
            name: 'read',
          },
        ],
      },
    );
  }

  async createGroup(organization: Organization) {
    await this.reloadToken();
    const name = `organization-${organization.name}`;
    const createdGroup = await this.kcAdminClient.groups.create({
      name: name,
      realm: this.realm,
    });
    await this.kcAdminClient.users.addToGroup({
      id: organization.createdByUserId,
      groupId: createdGroup.id,
      realm: this.realm,
    });
  }

  async inviteUserToGroup(
    authContext: AuthContext,
    groupId: string,
    userId: string,
  ) {
    await this.reloadToken();
    const keycloakUser = await this.kcAdminClient.users.findOne({
      id: authContext.keycloakUser.sub,
      realm: this.realm,
    });
    if (!keycloakUser) {
      console.log('user not found');
      throw new UnauthorizedException();
    }
    console.log(authContext.permissions);
    const groups = await this.kcAdminClient.users.listGroups({
      id: userId,
      realm: this.realm,
    });
    console.log(groups);
    if (!groups.some((g) => g.id === groupId)) {
      throw new ForbiddenException();
    }
    const keycloakUserRequester = await this.kcAdminClient.users.findOne({
      id: userId,
    });
    if (
      !keycloakUserRequester ||
      keycloakUserRequester.groups.includes(groupId)
    ) {
      throw new BadRequestException();
    }
    await this.kcAdminClient.users.addToGroup({
      id: userId,
      groupId: groupId,
      realm: this.realm,
    });
  }

  async getUsers() {
    await this.reloadToken();
    return this.kcAdminClient.users.find({ realm: this.realm });
  }

  async findKeycloakUserByEmail(email: string) {
    await this.reloadToken();
    const users = await this.kcAdminClient.users.find({
      realm: this.realm,
      email: email,
    });
    if (users.length === 0) {
      return null;
    } else if (users.length > 1) {
      this.logger.warn('More than one user found for email');
    }
    return users[0];
  }
}
