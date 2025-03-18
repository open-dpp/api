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
import { HttpService } from '@nestjs/axios';
import { User } from '../../users/domain/user';
import { UsersService } from '../../users/infrastructure/users.service';
import { KeycloakUserInToken } from './KeycloakUserInToken';
import { IS_PUBLIC } from '../public/public.decorator';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  private readonly PUBLIC_KEY =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtOVDaYfkFeq2eQvx5IcT04MPTGq8iPM0iEf+9LJ9YYkPR2BmEodqDmV9p6XgkHg0/JoRI8JPZVKe9wTmVO+KEvwQF/U9uaCSe0xVfaYv3YkaxsKzoKEfXNluFgQG0jm+NRzUdeUj8MbHUAbOkaS+UBgrqF8pASxdyqjBJ5kcQsZ5KeXj1eUmUPVMwcnoXju+e1h7a1ql0vyUlkrH6pkMStglkkXNYtaTa8dByO7+LOQzoTEzECsLFt5p0WTLMxR1Lutr//nK+ELMN562gUOlipbBjS420YWWW184Bnx3mK2mg2Ldn4GHBex9mjDb5ECEc/eNylgVwwaNinJ2T/WhIQIDAQAB';

  constructor(
    private reflector: Reflector,
    private httpService: HttpService,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly keycloakResourcesService: KeycloakResourcesService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // const [req] = context.getArgs();
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
    let keycloakId = null;
    authContext.permissions = [];

    const payload = await this.jwtService.verifyAsync(accessToken, {
      algorithms: ['RS256'],
      publicKey: this.formatPublicKey(this.PUBLIC_KEY),
    });
    keycloakId = payload.sub;
    const user: KeycloakUserInToken = payload;
    keycloakId = user.sub;
    authContext.keycloakUser = user;
    await this.usersService.create(user, true);
    authContext.user = new User(keycloakId, user.email);
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
