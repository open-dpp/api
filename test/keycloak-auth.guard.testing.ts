import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthContext } from '../src/auth/auth-request';
import { User } from '../src/users/domain/user';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../src/auth/public/public.decorator';

export class KeycloakAuthTestingGuard implements CanActivate {
  constructor(
    public tokenToUserMap: Map<string, User>,
    private reflector?: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    // const [req] = context.getArgs();
    const request = context.switchToHttp().getRequest();
    if (this.reflector) {
      const isPublic = this.reflector.get<boolean>(
        IS_PUBLIC,
        context.getHandler(),
      );
      if (isPublic) {
        return isPublic;
      }
    }

    const header = request.headers.authorization;
    if (!header) {
      throw new UnauthorizedException(
        'Authorization: Bearer <token> header missing',
      );
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Authorization: Bearer <token> header invalid',
      );
    }

    const accessToken = parts[1]; // uses [organizationOneId, organizationTwoId, ...] as permissions
    const decoded = Buffer.from(accessToken, 'base64').toString();
    const permissions = decoded.substring(1, decoded.length - 1).split(',');

    if (this.tokenToUserMap.has(accessToken)) {
      const authContext = new AuthContext();
      authContext.user = this.tokenToUserMap.get(accessToken);
      authContext.permissions = permissions.map((permission) => {
        return {
          type: 'organization',
          resource: permission,
          scopes: ['organization:access'],
        };
      });
      request.authContext = authContext;
      return true;
    } else {
      return false;
    }

    // const authContext: AuthContext = await this.keycloakAuthService.getAuthContextFromKeycloakUser(req.user, isPublic);
  }
}
