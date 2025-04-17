import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DppEventType } from '../domain/dpp-event-type.enum';

/**
 * DppEvent schema
 */
@Schema()
export class DppEventDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, enum: DppEventType })
  type: DppEventType;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: '' })
  @Prop({ required: true })
  dppId: string; // foreign key?

  @Prop({ type: Object, required: true })
  eventJsonData: object; // foreign key?
}

export const DppEventSchema = SchemaFactory.createForClass(DppEventDocument);
