import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthContext } from '../src/auth/auth-request';
import { User } from '../src/users/domain/user';

export class KeycloakAuthTestingGuard implements CanActivate {
  constructor(private readonly tokenToUserMap: Map<string, User>) {}
  async canActivate(context: ExecutionContext) {
    // const [req] = context.getArgs();

    const request = context.switchToHttp().getRequest();

    const header = request.headers.authorization;
    if (!header) {
      throw new HttpException(
        'Authorization: Bearer <token> header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new HttpException(
        'Authorization: Bearer <token> header invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = parts[1];

    if (this.tokenToUserMap.has(accessToken)) {
      const authContext = new AuthContext();
      authContext.user = this.tokenToUserMap.get(accessToken);
      request.authContext = authContext;
      return true;
    } else {
      return false;
    }

    // const authContext: AuthContext = await this.keycloakAuthService.getAuthContextFromKeycloakUser(req.user, isPublic);
  }
}
