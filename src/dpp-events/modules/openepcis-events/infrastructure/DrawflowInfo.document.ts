import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  DrawflowHomeDataDocument,
  DrawflowHomeDataSchema,
} from './DrawflowHomeData.document';

/**
 * DrawflowInfoDocument schema
 */
@Schema()
export class DrawflowInfoDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: {
      Home: DrawflowHomeDataSchema,
    },
  })
  drawflow: {
    Home: DrawflowHomeDataDocument;
  };
}

export const DrawflowInfoSchema =
  SchemaFactory.createForClass(DrawflowInfoDocument);
