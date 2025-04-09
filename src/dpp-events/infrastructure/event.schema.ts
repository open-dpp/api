import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Event schema - this is a placeholder since the full definition isn't available
 * in the provided schema snippet
 */
@Schema({ collection: 'dpp_event' })
export class EventDoc extends Document {
  @Prop({ required: true })
  _id: string;

  // Define Event properties here based on the full schema
}

export const EventSchema = SchemaFactory.createForClass(EventDoc);
