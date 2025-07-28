import { Module } from '@nestjs/common';
import { TemplateController } from './presentation/template.controller';
import { TemplateService } from './infrastructure/template.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateDoc, TemplateSchema } from './infrastructure/template.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TemplateDoc.name,
        schema: TemplateSchema,
      },
    ]),
    KeycloakResourcesModule,
    PermissionsModule,
  ],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
