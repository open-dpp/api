import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TraceabilityEvent } from '../domain/traceability-event';

export enum TraceabilityEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

/**
 * TraceabilityEvent schema
 */
@Schema({ collection: 'traceability-events' })
export class TraceabilityEventDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    default: TraceabilityEventSchemaVersion.v1_0_0,
    enum: TraceabilityEventSchemaVersion,
  })
  _schemaVersion: TraceabilityEventSchemaVersion;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ required: false, default: null })
  ip: string | null;

  @Prop({ required: false, default: null })
  userId: string | null;

  @Prop({ required: false, default: null })
  itemId: string | null;

  @Prop({ required: false, default: null })
  chargeId: string | null;

  @Prop({ required: false, default: null })
  organizationId: string | null;

  @Prop({ required: false, default: null, type: Object })
  geolocation: {
    latitude: string;
    longitude: string;
  } | null;

  @Prop({
    required: false,
  })
  type: string;

  @Prop({
    type: Object,
    required: true,
  })
  data: TraceabilityEvent;
}

export const DppEventSchema = SchemaFactory.createForClass(
  TraceabilityEventDocument,
);
