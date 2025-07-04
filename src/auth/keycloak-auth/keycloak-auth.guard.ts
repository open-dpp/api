import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthContext } from '../auth-request';
import { User } from '../../users/domain/user';
import { UsersService } from '../../users/infrastructure/users.service';
import { KeycloakUserInToken } from './KeycloakUserInToken';
import { IS_PUBLIC } from '../public/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly httpService: HttpService,
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

    const headerAuthorization = request.headers.authorization;
    const headerApiKey = request.headers['api_token'];
    let accessToken: string;

    if (headerAuthorization) {
      accessToken = await this.readTokenFromJwt(headerAuthorization);
    } else if (headerApiKey) {
      accessToken = await this.readTokenFromApiKeyOrFail(headerApiKey);
    } else {
      throw new UnauthorizedException('Authorization missing');
    }

    const authContext = new AuthContext();
    authContext.permissions = [];

    let payload: KeycloakUserInToken & { memberships: string[] | undefined };

    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        algorithms: ['RS256'],
        publicKey: this.formatPublicKey(
          this.configService.get('KEYCLOAK_JWT_PUBLIC_KEY'),
        ),
      });
    } catch {
      throw new UnauthorizedException(
        'Invalid token. Check if it is maybe expired.',
      );
    }
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

  private getAuthUrl() {
    const baseUrl = this.configService.get('KEYCLOAK_NETWORK_URL');
    if (!baseUrl) {
      throw new Error('KEYCLOAK_NETWORK_URL configuration is missing');
    }

    try {
      const url = new URL('/realms/open-dpp/api-key/auth', baseUrl);
      return url.toString();
    } catch {
      throw new Error('Invalid KEYCLOAK_NETWORK_URL configuration');
    }
  }

  private async readTokenFromApiKeyOrFail(
    headerApiKey: string,
  ): Promise<string> {
    const authUrl = this.getAuthUrl();
    const response = await firstValueFrom<AxiosResponse<{ jwt: string }>>(
      this.httpService.get(`${authUrl}?apiKey=${headerApiKey}`),
    );
    if (response.status === 200) {
      return response.data.jwt;
    } else {
      throw new UnauthorizedException('API Key invalid');
    }
  }

  private async readTokenFromJwt(jwt: string): Promise<string> {
    const parts = jwt.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Authorization: Bearer <token> header invalid',
      );
    }
    return parts[1];
  }

  private formatPublicKey(publicKey: string): string {
    // Format the public key with the proper PEM headers if needed
    return `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
  }
}
