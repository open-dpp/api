import { forwardRef, Module } from '@nestjs/common';
import { OrganizationsService } from './infrastructure/organizations.service';
import { OrganizationsController } from './presentation/organizations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from './infrastructure/organization.entity';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity]),
    KeycloakResourcesModule,
    forwardRef(() => UsersModule),
    PermissionsModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
