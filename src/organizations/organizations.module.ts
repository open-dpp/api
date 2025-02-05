import { Module } from '@nestjs/common';
import { OrganizationsService } from './infrastructure/organizations.service';
import { OrganizationsController } from './presentation/organizations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from './infrastructure/organization.entity';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity]),
    KeycloakResourcesModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
