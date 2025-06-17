import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelsModule } from './models/models.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UniqueProductIdentifierModule } from './unique-product-identifier/unique.product.identifier.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from './auth/keycloak-auth/keycloak-auth.guard';
import { HttpModule } from '@nestjs/axios';
import { ItemsModule } from './items/items.module';
import * as path from 'path';
import { generateConfig, generateMongoConfig } from './database/config';
import { KeycloakResourcesModule } from './keycloak-resources/keycloak-resources.module';
import { PermissionsModule } from './permissions/permissions.module';

import { ProductDataModelModule } from './product-data-model/product.data.model.module';
import { ProductDataModelDraftModule } from './product-data-model-draft/product-data-model-draft.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TraceabilityEventsModule } from './traceability-events/traceability-events.module';
import { KeycloakSyncOnStartupModule } from './keycloak-sync-on-startup/keycloak-sync-on-startup.module';
import { IntegrationModule } from './integrations/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...generateMongoConfig(configService),
      }),
      inject: [ConfigService],
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
    ProductDataModelDraftModule,
    ProductDataModelModule,
    ItemsModule,
    ModelsModule,
    OrganizationsModule,
    UsersModule,
    UniqueProductIdentifierModule,
    AuthModule,
    PermissionsModule,
    HttpModule,
    KeycloakResourcesModule,
    TraceabilityEventsModule,
    KeycloakSyncOnStartupModule,
    IntegrationModule,
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
