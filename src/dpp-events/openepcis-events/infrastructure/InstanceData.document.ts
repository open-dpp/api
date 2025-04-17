import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SerialTypeEnum } from '../domain/enums/SerialTypeEnum';
import { IdentifierTypeEnum } from '../domain/enums/IdentifierTypeEnum';

/**
 * InstanceDataDocument schema
 */
@Schema()
export class InstanceDataDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: String,
    enum: Object.values(IdentifierTypeEnum),
    required: true,
  })
  identifierType: IdentifierTypeEnum;

  @Prop({
    type: String,
    enum: Object.values(SerialTypeEnum),
    required: true,
  })
  serialType: SerialTypeEnum;

  @Prop({ required: true })
  gcp: string;

  @Prop({ required: true })
  serialNumber: string;

  @Prop({ required: true })
  rangeFrom: number;
}

export const InstanceDataSchema =
  SchemaFactory.createForClass(InstanceDataDocument);
