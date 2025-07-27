import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TemplateDoc } from './template.schema';
import { Model } from 'mongoose';
import { ModelDoc } from '../../models/infrastructure/model.schema';
import { deserializeTemplate } from '../domain/serialization';
import { ItemDoc } from '../../items/infrastructure/item.schema';
import { TemplateService } from './template.service';

@Injectable()
export class MigratePublicTemplatesService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(
    MigratePublicTemplatesService.name,
  );

  constructor(
    @InjectModel(TemplateDoc.name)
    private templateDoc: Model<TemplateDoc>,
    @InjectModel(ModelDoc.name)
    private modelDoc: Model<ModelDoc>,
    @InjectModel(ItemDoc.name)
    private itemDoc: Model<ItemDoc>,
    private templateService: TemplateService,
  ) {}

  async onApplicationBootstrap() {
    try {
      this.logger.log('Migrating templates with visibility Public');
      const templatesWithPublicFlag = await this.templateDoc
        .find({
          visibility: 'Public',
        })
        .exec();
      this.logger.log(
        `Found ${templatesWithPublicFlag.length} public templates to migrate`,
      );
      for (const templateDoc of templatesWithPublicFlag) {
        this.logger.log(
          `-------Migrating template ${templateDoc.name}, ${templateDoc._id}}---------`,
        );
        const modelsGroupedByOrga = await this.modelDoc.aggregate([
          {
            $match: {
              productDataModelId: templateDoc._id,
            },
          },
          {
            $group: {
              _id: '$ownedByOrganizationId',
              models: { $push: '$$ROOT' },
            },
          },
        ]);

        for (const modelGroup of modelsGroupedByOrga) {
          const organizationId = modelGroup._id;
          const models = modelGroup.models;

          if (!models || models.length === 0) {
            this.logger.warn(
              `No models found for organization ${organizationId}, skipping`,
            );
            continue;
          }

          this.logger.log(
            `++++Migrating models of organization ${organizationId}++++`,
          );

          const template = deserializeTemplate(templateDoc).copy(
            organizationId,
            models[0].createdByUserId,
          );
          this.logger.log('Save template copy', JSON.stringify(template));
          await this.templateService.save(template);
          this.logger.log(
            'Update and save models connected to the old template',
          );
          await this.modelDoc.updateMany(
            {
              productDataModelId: templateDoc._id,
              ownedByOrganizationId: organizationId,
            }, // find condition
            {
              $set: { templateId: template.id }, // set the new field
              $unset: { productDataModelId: '' }, // remove the old field
            },
          );

          this.logger.log(
            'Update and save items connected to the old template',
          );
          await this.itemDoc.updateMany(
            {
              productDataModelId: templateDoc._id,
              ownedByOrganizationId: organizationId,
            }, // find condition
            {
              $set: { templateId: template.id }, // set the new field
              $unset: { productDataModelId: '' }, // remove the old field
            },
          );
        }
        this.logger.log('Delete old template');
        await this.templateDoc.deleteOne({ _id: templateDoc._id });
      }
    } catch (error) {
      this.logger.error('Migration failed', error);
      throw error;
    }
  }
}
