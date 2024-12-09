import {Module} from '@nestjs/common';
import {KeycloakAuthService} from './keycloak-auth-service/keycloak-auth.service';
import {UsersModule} from "../users/users.module";

@Module({
    imports: [UsersModule],
    providers: [KeycloakAuthService],
})
export class AuthModule {
}
