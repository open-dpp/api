import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UntpEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

/**
 * UntpEvent schema
 */
@Schema({ collection: 'untp-events' })
export class UntpEventDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: Object })
  data: any;

  @Prop({
    default: UntpEventSchemaVersion.v1_0_0,
    enum: UntpEventSchemaVersion,
  })
  _schemaVersion: UntpEventSchemaVersion;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const UntpEventSchema = SchemaFactory.createForClass(UntpEventDocument);
