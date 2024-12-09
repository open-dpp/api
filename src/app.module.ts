import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { KeycloakImportModule } from './keycloak-import/keycloak-import.module';
import { PermalinksModule } from './permalinks/permalinks.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from './auth/keycloak-auth/keycloak-auth.guard';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'lc-db',
      port: 5432,
      username: 'living-circle',
      password: 'living-circle',
      database: 'living-circle',
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
      dropSchema: true,
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: KeycloakAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
