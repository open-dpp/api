import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  DrawflowNodeDocument,
  DrawflowNodeSchema,
} from './DrawflowNode.document';

/**
 * DrawflowHomeDataDocument schema
 */
@Schema()
export class DrawflowHomeDataDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: Map, of: DrawflowNodeSchema })
  data: Record<string, DrawflowNodeDocument>;
}

export const DrawflowHomeDataSchema = SchemaFactory.createForClass(
  DrawflowHomeDataDocument,
);
