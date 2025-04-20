import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * NodeDataDocument schema
 */
@Schema()
export class NodeDataDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  eventType: string;
}

export const NodeDataSchema = SchemaFactory.createForClass(NodeDataDocument);
