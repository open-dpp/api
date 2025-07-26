import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  createCommonIndexesForProductDataModel,
  TemplateBaseDoc,
} from '../../data-modelling/infrastructure/product-data-model-base.schema';

export enum TemplateDocSchemaVersion {
  v1_0_0 = '1.0.0',
  v1_0_1 = '1.0.1',
  v1_0_2 = '1.0.2',
}

@Schema({ collection: 'product_data_models' })
export class TemplateDoc extends TemplateBaseDoc {
  @Prop({
    default: TemplateDocSchemaVersion.v1_0_2,
    enum: TemplateDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: TemplateDocSchemaVersion;

  @Prop({
    required: false,
    default: null,
  })
  marketplaceResourceId: string;
}
export const TemplateSchema = SchemaFactory.createForClass(TemplateDoc);

createCommonIndexesForProductDataModel(TemplateSchema);
TemplateSchema.index({ marketplaceResourceId: 1 });
