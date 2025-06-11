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

  @Prop({
    type: TraceabilityEvent,
    required: true,
  })
  data: TraceabilityEvent;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const DppEventSchema = SchemaFactory.createForClass(
  TraceabilityEventDocument,
);
