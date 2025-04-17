import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NodeDataDocument, NodeDataSchema } from './NodeData.document';
import { NodeOutputDocument, NodeOutputSchema } from './NodeOutput.document';

/**
 * DrawflowNodeDocument schema
 */
@Schema()
export class DrawflowNodeDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: NodeDataSchema, required: true })
  data: NodeDataDocument;

  @Prop({ required: true })
  class: string;

  @Prop({ required: true })
  html: string;

  @Prop({ required: true })
  typenode: string;

  @Prop({ type: Map, of: MongooseSchema.Types.Mixed })
  inputs: Record<string, any>;

  @Prop({ type: Map, of: NodeOutputSchema })
  outputs: Record<string, NodeOutputDocument>;

  @Prop({ required: true })
  pos_x: number;

  @Prop()
  pos_y?: number;
}

export const DrawflowNodeSchema =
  SchemaFactory.createForClass(DrawflowNodeDocument);
