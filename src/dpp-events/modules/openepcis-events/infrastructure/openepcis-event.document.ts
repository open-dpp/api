import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum OpenepcisEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

/**
 * OpenepcisEvent schema
 */
@Schema()
export class OpenepcisEventDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: Object })
  data: any;

  @Prop({
    default: OpenepcisEventSchemaVersion.v1_0_0,
    enum: OpenepcisEventSchemaVersion,
  })
  _schemaVersion: OpenepcisEventSchemaVersion;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const OpenepcisEventSchema = SchemaFactory.createForClass(
  OpenepcisEventDocument,
);
