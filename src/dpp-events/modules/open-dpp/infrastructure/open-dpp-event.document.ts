import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OpenDppEventType } from '../domain/open-dpp-event-type.enum';

export enum OpenDppEventDocumentSchemaVersion {
  v1_0_0 = '1.0.0',
}

/**
 * OpenDppEvent schema
 */
@Schema()
export class OpenDppEventDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    default: OpenDppEventDocumentSchemaVersion.v1_0_0,
    enum: OpenDppEventDocumentSchemaVersion,
  })
  _schemaVersion: OpenDppEventDocumentSchemaVersion;

  @Prop({ required: true, enum: OpenDppEventType })
  type: OpenDppEventType;

  @Prop({ required: true })
  source: string;

  @Prop({ type: Object, required: true })
  eventJsonData: object;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const OpenDppEventSchema =
  SchemaFactory.createForClass(OpenDppEventDocument);
