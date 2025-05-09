import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { KeycloakResourcesService } from '../keycloak-resources/infrastructure/keycloak-resources.service';
import { AuthContext } from '../auth/auth-request';
import { ResourcePermission } from './resource-permission.interface';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private keycloakResourcesService: KeycloakResourcesService) {}

  /**
   * Check if user can access organization
   * @param authContext User auth context
   * @param organizationId ID of organization
   * @returns Boolean indicating if user has all required permissions
   */
  async canAccessOrganization(
    organizationId: string,
    authContext: AuthContext,
  ): Promise<boolean> {
    if (!authContext.permissions) {
      return false;
    }
    return authContext.permissions.some(
      (permission) =>
        permission.type === 'organization' &&
        permission.resource === organizationId &&
        permission.scopes.includes('organization:access'),
    );
  }

  /**
   * Check if user can access organization
   * @param authContext User auth context
   * @param organizationId ID of organization
   * @returns Boolean indicating if user has all required permissions
   * @throws ForbiddenException if user has no access to organization
   */
  async canAccessOrganizationOrFail(
    organizationId: string,
    authContext: AuthContext,
  ): Promise<boolean> {
    const canAccess = await this.canAccessOrganization(
      organizationId,
      authContext,
    );
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return canAccess;
  }

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
      let userPermissions: ResourcePermission[] = [];

      // Option 1: Use cached permissions from token if available
      if (authContext.permissions && authContext.permissions.length > 0) {
        userPermissions = authContext.permissions;
        this.logger.debug('Using cached permissions from auth context');
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
          (p) => p.resource === resourceName,
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
