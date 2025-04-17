import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EventInfoDocument, EventInfoSchema } from './EventInfo.document';
import { EventTypeEnum } from '../domain/enums/EventTypeEnum';

/**
 * EventNodeDocument schema
 */
@Schema()
export class EventNodeDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  eventId: number;

  @Prop({
    type: String,
    enum: Object.values(EventTypeEnum),
    required: true,
  })
  eventType: EventTypeEnum;

  @Prop({ type: EventInfoSchema, required: true })
  eventInfo: EventInfoDocument;
}

export const EventNodeSchema = SchemaFactory.createForClass(EventNodeDocument);
