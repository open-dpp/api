import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users.service';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';

@Injectable()
export class UsersSyncOnStartupService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(UsersSyncOnStartupService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly keycloakResourcesServices: KeycloakResourcesService,
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
    this.logger.log('Finished syncing users from Keycloak to database');
  }
}
