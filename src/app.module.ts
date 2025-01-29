import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakImportModule } from './keycloak-import/keycloak-import.module';
import { PermalinksModule } from './permalinks/permalinks.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from './auth/keycloak-auth/keycloak-auth.guard';
import { HttpModule } from '@nestjs/axios';
import { ItemsModule } from './items/items.module';
import * as path from 'path';
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
        synchronize: false,
        autoLoadEntities: true,
        dropSchema: false,
        migrationsTransactionMode: 'each',
        migrationsRun: true,
        migrations: [path.join(__dirname, '/migrations/**/*{.ts,.js}')],
      }),
      inject: [ConfigService],
    }),
    ItemsModule,
    ProductsModule,
    OrganizationsModule,
    UsersModule,
    KeycloakImportModule,
    PermalinksModule,
    AuthModule,
    HttpModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: KeycloakAuthGuard,
    },
  ],
})
export class AppModule {}
