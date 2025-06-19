import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  createCommonIndexesForProductDataModel,
  ProductDataModelBaseDoc,
} from '../../data-modelling/infrastructure/product-data-model-base.schema';

@Schema({ _id: false }) // No separate _id for embedded documents
class PublicationDoc {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  version: string;
}

const PublicationSchema = SchemaFactory.createForClass(PublicationDoc);

export enum ProductDataModelDraftDocSchemaVersion {
  v1_0_0 = '1.0.0',
  v1_0_1 = '1.0.1',
}

@Schema({ collection: 'product_data_model_drafts' })
export class ProductDataModelDraftDoc extends ProductDataModelBaseDoc {
  @Prop({
    default: ProductDataModelDraftDocSchemaVersion.v1_0_1,
    enum: ProductDataModelDraftDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ProductDataModelDraftDocSchemaVersion;

  @Prop({ type: [PublicationSchema], default: [] })
  publications: PublicationDoc[];
}
export const ProductDataModelDraftSchema = SchemaFactory.createForClass(
  ProductDataModelDraftDoc,
);

createCommonIndexesForProductDataModel(ProductDataModelDraftSchema);
