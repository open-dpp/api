import { Module } from '@nestjs/common';
import { TemplateDraftController } from './presentation/template-draft.controller';
import { TemplateService } from '../templates/infrastructure/template.service';
import { TemplateDraftService } from './infrastructure/template-draft.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TemplateDraftDoc,
  TemplateDraftSchema,
} from './infrastructure/template-draft.schema';
import {
  TemplateDoc,
  TemplateSchema,
} from '../templates/infrastructure/template.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TemplateDraftDoc.name,
        schema: TemplateDraftSchema,
      },
      {
        name: TemplateDoc.name,
        schema: TemplateSchema,
      },
    ]),
    MarketplaceModule,
    PermissionsModule,
  ],
  controllers: [TemplateDraftController],
  providers: [TemplateService, TemplateDraftService],
  exports: [TemplateDraftService],
})
export class TemplateDraftModule {}
