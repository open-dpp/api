import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {UsersService} from "../../users/users.service";
import {ConfigService} from "@nestjs/config";
import {OrganizationsService} from "../../organizations/organizations.service";
import {PermalinksService} from "../../permalinks/permalinks.service";
import {ProductsService} from "../../products/products.service";

const KeycloakAdminClient = require('fix-esm').require('@keycloak/keycloak-admin-client').default;

@Injectable()
export class KeycloakImportService implements OnApplicationBootstrap {

    constructor(
        private readonly usersService: UsersService,
        private readonly organizationService: OrganizationsService,
        private readonly productsService: ProductsService,
        private readonly permalinkService: PermalinksService,
        private readonly configService: ConfigService
    ) {
    }

    async onApplicationBootstrap() {
        const authClient = new KeycloakAdminClient({
            baseUrl: this.configService.get('KEYCLOAK_NETWORK_URL'),
            realmName: this.configService.get('KEYCLOAK_ADMIN_REALM'),
        });

        await authClient.auth({
            username: this.configService.get('KEYCLOAK_ADMIN_USERNAME'),
            password: this.configService.get('KEYCLOAK_ADMIN_PASSWORD'),
            clientId: this.configService.get('KEYCLOAK_ADMIN_CLIENT'),
            grantType: 'password',
        });

        authClient.setConfig({
            realmName: this.configService.get('KEYCLOAK_REALM'),
        });

        const keycloakUsers: any[] = await authClient.users.find({});
 
        let organizations = await this.organizationService.findAll();
        if (organizations.length === 0) {
            await this.organizationService.create({
                name: 'Living Circle',
            });
            organizations = await this.organizationService.findAll();
        }
        const organization = organizations[0];

        console.log('Importing users from Keycloak', keycloakUsers.length);
        for (const keycloakUser of keycloakUsers) {
            await this.usersService.create({
                keycloakId: keycloakUser.id,
                username: keycloakUser.username,
                organization_id: organization.id,
            });
        }

        const users = await this.usersService.findAll();

        const products = await this.productsService.findAll();
        if (products.length === 0) {
            const product = await this.productsService.create({
                name: 'Test Product',
                description: 'Test Product Description',
            });
            const permalink = await this.permalinkService.create({
                productId: product.id,
                view: 'client'
            });
        }
    }
}
