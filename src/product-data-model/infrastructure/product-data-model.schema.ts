import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VisibilityLevel } from '../domain/product.data.model';
import {
  createCommonIndexesForProductDataModel,
  ProductDataModelBaseDoc,
} from '../../data-modelling/infrastructure/product-data-model-base.schema';

export enum ProductDataModelDocSchemaVersion {
  v1_0_0 = '1.0.0',
  v1_0_1 = '1.0.1',
}

@Schema({ collection: 'product_data_models' })
export class ProductDataModelDoc extends ProductDataModelBaseDoc {
  @Prop({
    default: ProductDataModelDocSchemaVersion.v1_0_1,
    enum: ProductDataModelDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ProductDataModelDocSchemaVersion;

  @Prop({
    required: true,
    enum: VisibilityLevel,
  })
  visibility: VisibilityLevel;
}
export const ProductDataModelSchema =
  SchemaFactory.createForClass(ProductDataModelDoc);

createCommonIndexesForProductDataModel(ProductDataModelSchema);
