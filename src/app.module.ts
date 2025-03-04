import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelsModule } from './models/models.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakImportModule } from './keycloak-import/keycloak-import.module';
import { UniqueProductIdentifierModule } from './unique-product-identifier/unique.product.identifier.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from './auth/keycloak-auth/keycloak-auth.guard';
import { HttpModule } from '@nestjs/axios';
import { ItemsModule } from './items/items.module';
import * as path from 'path';
import { generateConfig } from './database/config';
import { KeycloakResourcesModule } from './keycloak-resources/keycloak-resources.module';
import { PermissionsModule } from './auth/permissions/permissions.module';

import { ProductDataModelModule } from './product-data-model/product.data.model.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...generateConfig(
          configService,
          path.join(__dirname, '/migrations/**/*{.ts,.js}'),
        ),
        autoLoadEntities: true,
        migrationsTransactionMode: 'each',
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    ProductDataModelModule,
    ItemsModule,
    ModelsModule,
    OrganizationsModule,
    UsersModule,
    KeycloakImportModule,
    UniqueProductIdentifierModule,
    AuthModule,
    PermissionsModule,
    HttpModule,
    KeycloakResourcesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: KeycloakAuthGuard,
    },
    // KeycloakPermissionsGuard is now provided by PermissionsModule
  ],
})
export class AppModule {}
