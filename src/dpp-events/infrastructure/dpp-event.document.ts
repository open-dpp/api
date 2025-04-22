import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DppEventType } from '../domain/dpp-event-type.enum';

export enum DppEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

/**
 * DppEvent schema
 */
@Schema({ discriminatorKey: 'kind', collection: 'dpp-events' })
export class DppEventDocument extends Document {
  @Prop({
    type: String,
    required: true,
    enum: [DppEventType.OPEN_DPP, DppEventType.OPENEPCIS, DppEventType.UNTP],
  })
  kind: string;

  @Prop({ required: true })
  _id: string;

  @Prop({
    default: DppEventSchemaVersion.v1_0_0,
    enum: DppEventSchemaVersion,
  })
  _schemaVersion: DppEventSchemaVersion;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const DppEventSchema = SchemaFactory.createForClass(DppEventDocument);
