import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DppEventType } from '../domain/dpp-event-type.enum';

/**
 * DppEvent schema
 */
@Schema()
export class DppEventDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, enum: DppEventType })
  type: DppEventType;

  @Prop({ required: true })
  source: string;

  @Prop({ type: Object, required: true })
  eventJsonData: object;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const DppEventSchema = SchemaFactory.createForClass(DppEventDocument);
