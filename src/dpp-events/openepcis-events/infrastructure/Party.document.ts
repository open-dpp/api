import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GlnTypeEnum } from '../domain/enums/GlnTypeEnum';
import { PartyTypeEnum } from '../domain/enums/PartyTypeEnum';

/**
 * PartyDocument schema
 */
@Schema()
export class PartyDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: String,
    enum: Object.values(PartyTypeEnum),
    required: true,
  })
  type: PartyTypeEnum;

  @Prop({
    type: String,
    enum: Object.values(GlnTypeEnum),
    required: true,
  })
  glnType: GlnTypeEnum;

  @Prop({ required: true })
  gln: string;

  @Prop({ required: true })
  extension: number;
}

export const PartySchema = SchemaFactory.createForClass(PartyDocument);
