import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * BizTransactionDocument schema
 */
@Schema()
export class BizTransactionDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop()
  type: string;

  @Prop()
  bizTransaction: string;
}

export const BizTransactionSchema = SchemaFactory.createForClass(
  BizTransactionDocument,
);
