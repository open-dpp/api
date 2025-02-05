import { User } from '../users/domain/user';

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
}

export interface AuthRequest extends Request {
  authContext: AuthContext;
}
