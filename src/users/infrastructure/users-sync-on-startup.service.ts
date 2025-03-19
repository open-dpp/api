import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users.service';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { AuthContext } from '../../auth/auth-request';

@Injectable()
export class UsersSyncOnStartupService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(UsersSyncOnStartupService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly keycloakResourcesServices: KeycloakResourcesService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Syncing users from Keycloak to database');
    const keycloakUsers = await this.keycloakResourcesServices.getUsers();
    this.logger.log(`Found ${keycloakUsers.length} users`);
    for (const keycloakUser of keycloakUsers) {
      const user = await this.usersService.findOne(keycloakUser.id);
      if (!user) {
        await this.usersService.create({
          sub: keycloakUser.id,
          name: keycloakUser.firstName + ' ' + keycloakUser.lastName,
          email: keycloakUser.email,
          email_verified: keycloakUser.emailVerified,
          preferred_username: keycloakUser.username,
        });
      }
    }
    const organizations = await this.organizationsService.findAll();
    for (const organization of organizations) {
      const keycloakGroup =
        await this.keycloakResourcesServices.getGroupForOrganization(
          organization.id,
        );
      if (!keycloakGroup) {
        console.log('Creating group for organization', organization.id);
        await this.keycloakResourcesServices.createGroup(organization);
      }
      for (const member of organization.members) {
        try {
          const authContext = new AuthContext();
          authContext.keycloakUser = {
            sub: organization.createdByUserId,
            email: '',
            name: '',
            preferred_username: '',
            email_verified: true,
          };
          await this.keycloakResourcesServices.inviteUserToGroup(
            authContext,
            organization.id,
            member.id,
          );
        } catch (exception) {
          if (exception.status !== 400) {
            console.warn(exception);
          }
        }
      }
    }
    this.logger.log('Finished syncing users from Keycloak to database');
  }
}
