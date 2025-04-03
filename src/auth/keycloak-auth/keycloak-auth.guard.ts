import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthContext } from '../auth-request';
import { User } from '../../users/domain/user';
import { UsersService } from '../../users/infrastructure/users.service';
import { KeycloakUserInToken } from './KeycloakUserInToken';
import { IS_PUBLIC } from '../public/public.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC,
      context.getHandler(),
    );
    if (isPublic) {
      return isPublic;
    }

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

    const authContext = new AuthContext();
    authContext.permissions = [];

    const payload = await this.jwtService.verifyAsync(accessToken, {
      algorithms: ['RS256'],
      publicKey: this.formatPublicKey(
        this.configService.get('KEYCLOAK_JWT_PUBLIC_KEY'),
      ),
    });
    const user: KeycloakUserInToken = payload;
    authContext.keycloakUser = user;
    await this.usersService.create(user, true);
    authContext.user = new User(payload.sub, user.email);
    const memberships = payload.memberships || ([] as string[]);
    memberships.forEach((membership: string) => {
      authContext.permissions.push({
        type: 'organization',
        resource: membership.substring(
          membership.lastIndexOf('organization-') + 13,
        ),
        scopes: ['organization:access'],
      });
    });
    request.authContext = authContext;
    return true;
  }

  private formatPublicKey(publicKey: string): string {
    // Format the public key with the proper PEM headers if needed
    return `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
  }
}
