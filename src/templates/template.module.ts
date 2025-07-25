import { Module } from '@nestjs/common';
import { TemplateController } from './presentation/template.controller';
import { TemplateService } from './infrastructure/template.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateDoc, TemplateSchema } from './infrastructure/template.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';
import { MigratePublicTemplatesService } from './infrastructure/migrate-public-templates.service';
import { ModelDoc, ModelSchema } from '../models/infrastructure/model.schema';
import { ItemDoc, ItemSchema } from '../items/infrastructure/item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TemplateDoc.name,
        schema: TemplateSchema,
      },
      {
        name: ModelDoc.name, // TODO: Remove after migration
        schema: ModelSchema,
      },
      {
        name: ItemDoc.name, // TODO: Remove after migration
        schema: ItemSchema,
      },
    ]),
    KeycloakResourcesModule,
    PermissionsModule,
  ],
  controllers: [TemplateController],
  providers: [TemplateService, MigratePublicTemplatesService],
  exports: [TemplateService],
})
export class TemplateModule {}
