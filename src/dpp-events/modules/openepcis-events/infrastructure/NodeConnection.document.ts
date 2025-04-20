import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * NodeConnectionDocument schema
 */
@Schema()
export class NodeConnectionDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  node: string;

  @Prop({ required: true })
  output: string;
}

export const NodeConnectionSchema = SchemaFactory.createForClass(
  NodeConnectionDocument,
);
