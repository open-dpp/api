import { User } from '../users/entities/user.entity';

export const AUTH_CONTEXT = 'authContext';

export class AuthContext {
  user: User;
}

export interface AuthRequest extends Request {
  authContext: AuthContext;
}
