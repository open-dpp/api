import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DppEventData } from '../domain/dpp-event-data';
import { DppEventIdentifier } from '../domain/dpp-event-identifier';

export enum DppEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

/**
 * DppEvent schema
 */
@Schema({ collection: 'dpp-events' })
export class DppEventDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    default: DppEventSchemaVersion.v1_0_0,
    enum: DppEventSchemaVersion,
  })
  _schemaVersion: DppEventSchemaVersion;

  @Prop({
    type: DppEventData,
    required: true,
  })
  data: DppEventData;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ type: DppEventIdentifier, required: true })
  identifier: DppEventIdentifier;
}

export const DppEventSchema = SchemaFactory.createForClass(DppEventDocument);
