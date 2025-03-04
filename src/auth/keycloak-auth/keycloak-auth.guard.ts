import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AuthContext } from '../auth-request';
import { HttpService } from '@nestjs/axios';
import { User } from '../../users/domain/user';
import { UsersService } from '../../users/infrastructure/users.service';
import { KeycloakUserInToken } from './KeycloakUserInToken';
import { IS_PUBLIC } from '../public/public.decorator';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private httpService: HttpService,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly keycloakResourcesService: KeycloakResourcesService,
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

    const urlPermissions = `${this.configService.get('KEYCLOAK_NETWORK_URL')}/realms/${this.configService.get('KEYCLOAK_REALM')}/protocol/openid-connect/token`;
    const urlUserinfo = `${this.configService.get('KEYCLOAK_NETWORK_URL')}/realms/${this.configService.get('KEYCLOAK_REALM')}/protocol/openid-connect/userinfo`;

    let keycloakId = null;
    const authContext = new AuthContext();
    authContext.permissions = [];
    try {
      const data = new URLSearchParams();
      data.append('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket');
      data.append('audience', 'backend');
      data.append('response_mode', 'permissions');
      const responsePermissions = await firstValueFrom(
        this.httpService.post<any>(urlPermissions, data, {
          headers: {
            authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      responsePermissions.data.forEach((p) => {
        authContext.permissions.push(p);
      });

      const responseUserinfo = await firstValueFrom(
        this.httpService.post<any>(urlUserinfo, data, {
          headers: {
            authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      const user: KeycloakUserInToken = responseUserinfo.data;
      keycloakId = user.sub;
      authContext.keycloakUser = user;
      await this.usersService.create(user, true);
      authContext.user = new User(keycloakId, user.email);
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
    request.authContext = authContext;
    return true;
  }
}
