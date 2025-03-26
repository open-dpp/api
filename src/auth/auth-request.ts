import { User } from '../users/domain/user';
import { KeycloakUserInToken } from './keycloak-auth/KeycloakUserInToken';
import { Request } from 'express';
import { ResourcePermission } from '../permissions/resource-permission.interface';

export const AUTH_CONTEXT = 'authContext';

export class AuthContext {
  user: User;
  permissions: Array<ResourcePermission>;
  token: string;
  keycloakUser: KeycloakUserInToken;
}

export interface AuthRequest extends Request {
  authContext: AuthContext;
}
