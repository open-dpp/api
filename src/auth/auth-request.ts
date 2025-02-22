import { User } from '../users/domain/user';
import { KeycloakUserInToken } from './keycloak-auth/KeycloakUserInToken';

export const AUTH_CONTEXT = 'authContext';

export interface KeycloakPermission {
  rsid: string;
  rsname: string;
  scopes: string[];
}

export class AuthContext {
  user: User;
  permissions: Array<KeycloakPermission>;
  token: string;
  keycloakUser: KeycloakUserInToken;
}

export interface AuthRequest extends Request {
  authContext: AuthContext;
}
