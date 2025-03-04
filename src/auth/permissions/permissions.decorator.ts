import { SetMetadata } from '@nestjs/common';
import { ResourcePermission } from './permissions.service';

export const REQUIRED_PERMISSIONS = 'required_permissions';

/**
 * Decorator to specify required permissions for a route
 * @example
 * @HasPermissions([{ type: 'organization', resource: 'org123', scopes: ['read'] }])
 * @HasPermissions([{ type: 'item', resource: 'item456' }])
 */
export const HasPermissions = (permissions: ResourcePermission[]) =>
  SetMetadata(REQUIRED_PERMISSIONS, permissions);
