import { SetMetadata } from '@nestjs/common';
import { KeycloakPermission } from '../auth-request';

export const HAS_PERMISSION = 'has_permissions';

export const HasPermissions = (...args: KeycloakPermission[]) =>
  SetMetadata(HAS_PERMISSION, args);
