import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * ConnectorDocument schema
 */
@Schema()
export class ConnectorDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  target: string;

  @Prop({ default: false })
  hideInheritParentCount: boolean;

  @Prop({ default: 0 })
  epcCount: number;

  @Prop({ default: 0 })
  inheritParentCount: number;

  @Prop({ default: 0 })
  classCount: number;

  @Prop({ default: 0 })
  quantity: number;
}

export const ConnectorSchema = SchemaFactory.createForClass(ConnectorDocument);
