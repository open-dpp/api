import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { VisibilityLevel } from '../domain/product.data.model';
import { DataFieldType } from '../domain/data.field';
import { SectionType } from '../domain/section';

@Schema()
class DataFieldDoc {
  @Prop({ required: true })
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, enum: DataFieldType })
  type: DataFieldType;
  @Prop({ required: true, type: MongooseSchema.Types.Mixed }) // Accepts any JSON object
  options: Record<string, unknown>;
}
const DataFieldSchema = SchemaFactory.createForClass(DataFieldDoc);

@Schema()
class SectionDoc {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: SectionType })
  type: SectionType;
  @Prop({ type: [DataFieldSchema], default: [] })
  dataFields: DataFieldDoc[];
}
const SectionSchema = SchemaFactory.createForClass(SectionDoc);

export enum ProductDataModelDocSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema({ collection: 'product_data_models' })
export class ProductDataModelDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    default: ProductDataModelDocSchemaVersion.v1_0_0,
    enum: ProductDataModelDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ProductDataModelDocSchemaVersion;

  @Prop({
    required: true,
    enum: VisibilityLevel,
  })
  visibility: VisibilityLevel;

  @Prop({ required: true })
  version: string;

  @Prop({ type: [SectionSchema], default: [] })
  sections: SectionDoc[];

  @Prop({ required: true })
  createdByUserId: string;

  @Prop({ required: true })
  ownedByOrganizationId: string;
}
export const ProductDataModelSchema =
  SchemaFactory.createForClass(ProductDataModelDoc);
