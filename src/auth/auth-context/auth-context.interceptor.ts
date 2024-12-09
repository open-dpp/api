import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Reflector} from "@nestjs/core";
import {KeycloakAuthService} from "../keycloak-auth-service/keycloak-auth.service";
import {ConfigService} from "@nestjs/config";
import {HttpService} from "@nestjs/axios";
import {UsersService} from "../../users/users.service";

@Injectable()
export class AuthContextInterceptor implements NestInterceptor {
    constructor(
        private keycloakAuthService: KeycloakAuthService,
        private reflector: Reflector,
        private httpService: HttpService,
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const isPublic = this.reflector.get<boolean>(
            'public',
            context.getHandler(),
        );
        return next.handle();
    }
}
