import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProductsModule} from './products/products.module';
import {OrganizationsModule} from './organizations/organizations.module';
import {UsersModule} from './users/users.module';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {KeycloakImportModule} from './keycloak-import/keycloak-import.module';
import {PermalinksModule} from './permalinks/permalinks.module';
import {AuthModule} from './auth/auth.module';
import {APP_GUARD} from "@nestjs/core";
import {KeycloakAuthGuard} from "./auth/keycloak-auth/keycloak-auth.guard";
import {AppService} from "./app.service";
import {HttpModule} from "@nestjs/axios";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [],
                synchronize: true,
                autoLoadEntities: true,
                dropSchema: true,
            }),
            inject: [ConfigService],
        }),
        ProductsModule,
        OrganizationsModule,
        UsersModule,
        KeycloakImportModule,
        PermalinksModule,
        AuthModule,
        HttpModule,
    ],
    controllers: [AppController],
    providers: [{
        provide: APP_GUARD,
        useClass: KeycloakAuthGuard,
    }, AppService],
})
export class AppModule {}
