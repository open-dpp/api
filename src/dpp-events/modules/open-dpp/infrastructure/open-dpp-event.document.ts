import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UniqueProductIdentifierCreatedEventDocument } from './open-dpp-events/unique-product-identifier-created.event-document';
import { OpenDppEventSchemaVersion } from '../domain/open-dpp-event';
import { OpenDppEventType } from '../domain/open-dpp-event-type.enum';

/**
 * OpenDppEvent schema
 */
@Schema({ discriminatorKey: 'kind' })
export class OpenDppEventDocument extends Document {
  @Prop({
    type: String,
    required: true,
    enum: [UniqueProductIdentifierCreatedEventDocument.name],
  })
  kind: string;

  @Prop({ required: true })
  _id: string;

  @Prop({
    type: String,
    enum: OpenDppEventType,
  })
  type: OpenDppEventType;

  @Prop()
  subType: string;

  @Prop()
  source: string;

  @Prop({ type: Object })
  eventJsonData: any;

  @Prop({
    default: OpenDppEventSchemaVersion.v1_0_0,
    enum: OpenDppEventSchemaVersion,
  })
  _schemaVersion: OpenDppEventSchemaVersion;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const OpenDppEventSchema =
  SchemaFactory.createForClass(OpenDppEventDocument);
