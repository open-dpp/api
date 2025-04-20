import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  NodeConnectionDocument,
  NodeConnectionSchema,
} from './NodeConnection.document';

/**
 * NodeOutputDocument schema
 */
@Schema()
export class NodeOutputDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: [NodeConnectionSchema] })
  connections: NodeConnectionDocument[];
}

export const NodeOutputSchema =
  SchemaFactory.createForClass(NodeOutputDocument);
