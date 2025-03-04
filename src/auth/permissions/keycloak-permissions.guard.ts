import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../public/public.decorator';
import { REQUIRED_PERMISSIONS } from './permissions.decorator';
import { PermissionsService, ResourcePermission } from './permissions.service';
import { AuthRequest } from '../auth-request';

@Injectable()
export class KeycloakPermissionsGuard implements CanActivate {
  private readonly logger = new Logger(KeycloakPermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the endpoint is marked as public
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    // Get the required permissions from the decorator
    const requiredPermissions = this.reflector.get<ResourcePermission[]>(
      REQUIRED_PERMISSIONS,
      context.getHandler(),
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();

    // Check if authContext exists
    if (!request.authContext) {
      this.logger.warn('No auth context found in request');
      throw new UnauthorizedException('Authentication required');
    }

    // Replace dynamic parameters in permission resources
    const resolvedPermissions = this.resolveDynamicParameters(
      requiredPermissions,
      request.params,
    );
    this.logger.log(
      `Resolved permissions: ${JSON.stringify(resolvedPermissions)}`,
    );

    // Check if the user has the required permissions
    const hasPermission = await this.permissionsService.hasPermission(
      request.authContext,
      resolvedPermissions,
    );

    if (!hasPermission) {
      this.logger.warn(
        `User ${request.authContext.user?.id} does not have required permissions`,
      );
      return false;
    }

    return true;
  }

  /**
   * Resolves dynamic parameters in permission resources
   * E.g. if resource is ':id' and params has {id: '123'}, it will return '123'
   */
  private resolveDynamicParameters(
    permissions: ResourcePermission[],
    params: Record<string, string>,
  ): ResourcePermission[] {
    if (!params || Object.keys(params).length === 0) {
      return permissions;
    }

    return permissions.map((permission) => {
      let resource = permission.resource;

      // Check if resource is a parameter reference (starting with ':')
      if (resource.startsWith(':')) {
        const paramName = resource.substring(1); // Remove the colon
        if (params[paramName]) {
          resource = params[paramName];
        } else {
          this.logger.warn(
            `Parameter ${paramName} not found in request params`,
          );
        }
      }

      return {
        ...permission,
        resource,
      };
    });
  }
}
