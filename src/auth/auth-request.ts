import { User } from '../users/domain/user';

export const AUTH_CONTEXT = 'authContext';

export class AuthContext {
  user: User;
}

export interface AuthRequest extends Request {
  authContext: AuthContext;
}
