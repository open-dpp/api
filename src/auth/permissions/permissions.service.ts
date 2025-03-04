import { Injectable, Logger } from '@nestjs/common';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { AuthContext, KeycloakPermission } from '../auth-request';

export interface ResourcePermission {
  type: string;
  resource: string;
  scopes?: string[];
}

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private keycloakResourcesService: KeycloakResourcesService) {}

  /**
   * Check if user has all required permissions
   * @param authContext User auth context
   * @param requiredPermissions Array of required permissions
   * @returns Boolean indicating if user has all required permissions
   */
  async hasPermission(
    authContext: AuthContext,
    requiredPermissions: ResourcePermission[],
  ): Promise<boolean> {
    try {
      // Get user permissions from Keycloak (fresh data) or use cached permissions
      let userPermissions: KeycloakPermission[] = [];

      // Option 1: Use cached permissions from token if available
      if (authContext.permissions && authContext.permissions.length > 0) {
        userPermissions = authContext.permissions;
        this.logger.debug('Using cached permissions from auth context');
      }
      // Option 2: Fetch fresh permissions from Keycloak
      else if (authContext.user && authContext.user.id) {
        userPermissions = authContext.permissions;
        this.logger.debug(
          `Fetched ${userPermissions.length} permissions from Keycloak for user ${authContext.user.id}`,
        );
      } else {
        this.logger.warn('No user ID available to fetch permissions');
        return false;
      }

      // Check if user has all required permissions
      return requiredPermissions.every((requiredPermission) => {
        // Format the resource name as expected by Keycloak
        const resourceName = `${requiredPermission.type}:${requiredPermission.resource}`;

        // Check if user has permission for this resource
        const matchedPermission = userPermissions.find(
          (p) => p.rsname === resourceName,
        );

        if (!matchedPermission) {
          this.logger.debug(
            `Permission check failed: resource "${resourceName}" not found`,
          );
          return false;
        }

        // If specific scopes are required, check those too
        if (requiredPermission.scopes && requiredPermission.scopes.length > 0) {
          const hasRequiredScopes = requiredPermission.scopes.every((scope) =>
            matchedPermission.scopes.includes(scope),
          );

          if (!hasRequiredScopes) {
            this.logger.debug(
              `Permission check failed: missing required scopes for "${resourceName}". ` +
                `Required: [${requiredPermission.scopes.join(', ')}], ` +
                `Available: [${matchedPermission.scopes.join(', ')}]`,
            );
            return false;
          }
        }

        // All checks passed for this permission
        return true;
      });
    } catch (error) {
      this.logger.error('Error checking permissions:', error);
      return false;
    }
  }
}
