import {CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Reflector} from "@nestjs/core";
import {ConfigService} from "@nestjs/config";
import {firstValueFrom} from "rxjs";
import {AuthContext} from "../auth-request";
import {HttpService} from "@nestjs/axios";
import {UsersService} from "../../users/users.service";

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private usersService: UsersService,
        private httpService: HttpService,
        private configService: ConfigService
    ) {

    }

    async canActivate(context: ExecutionContext) {
        // const [req] = context.getArgs();
        const request = context.switchToHttp().getRequest();
        const isPublic = this.reflector.get<boolean>(
            'public',
            context.getHandler(),
        );
        if (isPublic) {
            return isPublic;
        }

        const header = request.headers.authorization;
        if (!header) {
            throw new HttpException('Authorization: Bearer <token> header missing', HttpStatus.UNAUTHORIZED);
        }

        const parts = header.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new HttpException('Authorization: Bearer <token> header invalid', HttpStatus.UNAUTHORIZED);
        }

        const accessToken = parts[1];

        const url = `${this.configService.get('KEYCLOAK_NETWORK_URL')}/realms/${this.configService.get('KEYCLOAK_REALM')}/protocol/openid-connect/userinfo`;
        let keycloakId = null;
        try {
            const response = await firstValueFrom(this.httpService.get<any>(url, {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            }));

            const user = {
                id: response.data.sub,
                username: response.data.preferred_username,
            };
            keycloakId = user.id;
        } catch (e) {
            throw new Error(e.message);
        }
        // const authContext: AuthContext = await this.keycloakAuthService.getAuthContextFromKeycloakUser(req.user, isPublic);
        const authContext = new AuthContext();
        const foundUser = await this.usersService.findOne({
            where: {
                keycloakId,
            }
        });
        authContext.user = foundUser;
        console.log(foundUser.id + ' guarded');
        request.authContext = authContext;

        return true;
    }
}
