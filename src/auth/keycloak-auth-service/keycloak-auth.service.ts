import {ForbiddenException, Inject, Injectable} from '@nestjs/common';
import {UsersService} from "../../users/users.service";
import {AuthContext} from "../auth-request";

@Injectable()
export class KeycloakAuthService {
    constructor(
        @Inject(UsersService)
        private usersService: UsersService,
    ) {
    }

    getAuthContextFromKeycloakUser = async (keycloakUser: any, isPublic: boolean) => {
        const authContext = new AuthContext();

        if (!keycloakUser && isPublic) {
            return authContext;
        }

        // authContext.keycloakUser = keycloakUser;
        const user = await this.usersService.findOne(
            {where: {keycloakId: keycloakUser?.sub}}
        );
        if (!user && !isPublic) {
            throw new ForbiddenException();
        }

        if (user) {
            authContext.user = user;
        }

        return authContext;
    };
}
