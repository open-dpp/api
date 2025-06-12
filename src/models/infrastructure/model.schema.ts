import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
export enum ModelDocSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema({ _id: false })
export class DataValueDoc {
  @Prop({ required: true })
  _id: string;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  value?: unknown;
  @Prop({ required: false })
  row?: number;
  @Prop({ required: true })
  dataSectionId: string;
  @Prop({ required: true })
  dataFieldId: string;
}

export const DataValueSchema = SchemaFactory.createForClass(DataValueDoc);

@Schema({ collection: 'models', timestamps: true })
export class ModelDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  createdByUserId: string;

  @Prop({ required: true })
  ownedByOrganizationId: string;

  @Prop({
    default: ModelDocSchemaVersion.v1_0_0,
    enum: ModelDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ModelDocSchemaVersion;

  @Prop({ type: [DataValueSchema], default: [] })
  dataValues: DataValueDoc[];

  @Prop({ required: false })
  productDataModelId?: string;

  @Prop({ required: false })
  description?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
export const ModelSchema = SchemaFactory.createForClass(ModelDoc);
