import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SectionType } from '../../product-data-model/domain/section';
import { DataFieldType } from '../../product-data-model/domain/data.field';

@Schema({ _id: false }) // No separate _id for embedded documents
class PublicationDoc {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  version: string;
}

const PublicationSchema = SchemaFactory.createForClass(PublicationDoc);

@Schema() // No separate _id for embedded documents
class DataFieldDraftDoc {
  @Prop({ required: true })
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, enum: DataFieldType })
  type: DataFieldType;
  @Prop({ required: true, type: MongooseSchema.Types.Mixed }) // Accepts any JSON object
  options: Record<string, unknown>;
}
const DataFieldDraftSchema = SchemaFactory.createForClass(DataFieldDraftDoc);

@Schema() // No separate _id for embedded documents
class SectionDraftDoc {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: SectionType })
  type: SectionType;
  @Prop({ type: [DataFieldDraftSchema], default: [] })
  dataFields: DataFieldDraftDoc[];
}
const SectionDraftSchema = SchemaFactory.createForClass(SectionDraftDoc);

export enum ProductDataModelDraftDocSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema({ collection: 'product_data_model_drafts' })
export class ProductDataModelDraftDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    default: ProductDataModelDraftDocSchemaVersion.v1_0_0,
    enum: ProductDataModelDraftDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ProductDataModelDraftDocSchemaVersion;

  @Prop({ required: true })
  version: string;

  @Prop({ type: [PublicationSchema], default: [] })
  publications: PublicationDoc[];

  @Prop({ type: [SectionDraftSchema], default: [] })
  sections: SectionDraftDoc[];

  @Prop({ required: true })
  createdByUserId: string;

  @Prop({ required: true })
  ownedByOrganizationId: string;
}
export const ProductDataModelDraftSchema = SchemaFactory.createForClass(
  ProductDataModelDraftDoc,
);
