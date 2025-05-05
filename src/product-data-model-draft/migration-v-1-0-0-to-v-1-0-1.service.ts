import { Injectable, Logger } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftDocSchemaVersion,
} from './infrastructure/product-data-model-draft.schema';
import { ProductDataModelDraftService } from './infrastructure/product-data-model-draft.service';
import { ProductDataModelDraft } from './domain/product-data-model-draft';
import { replaceUnderscoreIdToId } from '../utils';
import {
  ProductDataModelDoc,
  ProductDataModelDocSchemaVersion,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { ProductDataModel } from '../product-data-model/domain/product.data.model';
import { ProductDataModelService } from '../product-data-model/infrastructure/product-data-model.service';

// TODO: Delete after running migration service
@Injectable()
export class MigrationV100ToV101Service {
  private readonly logger = new Logger(MigrationV100ToV101Service.name);

  constructor(
    @InjectModel(ProductDataModelDraftDoc.name)
    private productDataModelDraftDocModel: Model<ProductDataModelDraftDoc>,
    @InjectModel(ProductDataModelDoc.name)
    private productDataModelDocModel: Model<ProductDataModelDoc>,
    private productDataModelDraftService: ProductDataModelDraftService,
    private productDataModelService: ProductDataModelService,
  ) {}

  async migrateDrafts() {
    this.logger.log('Migrating drafts');
    const defaultLayout = {
      colStart: { sm: 1 },
      rowSpan: { sm: 1 },
      rowStart: { sm: 1 },
      colSpan: { sm: 1 },
    };
    const colSm = { sm: 2 };
    const defaultSectionLayout = {
      cols: colSm,
      ...defaultLayout,
    };
    const oldSchemas = await this.productDataModelDraftDocModel.find({
      _schemaVersion: ProductDataModelDraftDocSchemaVersion.v1_0_0,
    });
    for (const oldSchema of oldSchemas) {
      this.logger.log(`Migrating draft ${oldSchema._id}`);
      const plain = oldSchema.toObject();
      const newSections = plain.sections.map((section) => ({
        ...section,
        layout: section.layout ?? defaultSectionLayout,
        dataFields: section.dataFields.map((dataField, index) => ({
          ...dataField,
          layout: dataField.layout ?? {
            ...defaultLayout,
            colStart: { sm: (index % colSm.sm) + 1 },
          },
        })),
      }));
      const newDraft = ProductDataModelDraft.fromPlain(
        replaceUnderscoreIdToId({
          ...plain,
          sections: newSections,
        }),
      );

      await this.productDataModelDraftService.save(newDraft);
      this.logger.log(`Successfully migrated ${oldSchema.id}`);
    }
  }

  async migrateDataModels() {
    this.logger.log('Migrating data models');
    const defaultLayout = {
      colStart: { sm: 1 },
      rowSpan: { sm: 1 },
      rowStart: { sm: 1 },
      colSpan: { sm: 1 },
    };
    const colSm = { sm: 2 };
    const defaultSectionLayout = {
      cols: colSm,
      ...defaultLayout,
    };
    const oldSchemas = await this.productDataModelDocModel.find({
      _schemaVersion: ProductDataModelDocSchemaVersion.v1_0_0,
    });
    for (const oldSchema of oldSchemas) {
      this.logger.log(`Migrating data model ${oldSchema._id}`);
      const plain = oldSchema.toObject();
      const newSections = plain.sections.map((section) => ({
        ...section,
        layout: section.layout ?? defaultSectionLayout,
        dataFields: section.dataFields.map((dataField, index) => ({
          ...dataField,
          layout: dataField.layout ?? {
            ...defaultLayout,
            colStart: { sm: (index % colSm.sm) + 1 },
          },
        })),
      }));
      const newDataModel = ProductDataModel.fromPlain(
        replaceUnderscoreIdToId({
          ...plain,
          sections: newSections,
        }),
      );

      await this.productDataModelService.save(newDataModel);
      this.logger.log(`Successfully migrated ${oldSchema.id}`);
    }
  }
}
