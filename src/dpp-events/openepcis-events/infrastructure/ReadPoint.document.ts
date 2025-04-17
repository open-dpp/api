import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ReadPointTypeEnum } from '../domain/enums/ReadPointTypeEnum';

/**
 * ReadPointDocument schema
 */
@Schema()
export class ReadPointDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: String,
    enum: Object.values(ReadPointTypeEnum),
    required: true,
  })
  type: ReadPointTypeEnum;

  @Prop({ required: true })
  gln: string;

  @Prop()
  extension?: number;
}

export const ReadPointSchema = SchemaFactory.createForClass(ReadPointDocument);
