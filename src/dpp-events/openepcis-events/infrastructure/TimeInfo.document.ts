import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeSelectorEnum } from '../domain/enums/TimeSelectorEnum';

/**
 * TimeInfoDocument schema
 */
@Schema()
export class TimeInfoDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: String,
    enum: Object.values(TimeSelectorEnum),
    required: true,
  })
  timeSelector: TimeSelectorEnum;

  @Prop()
  specificTime?: string;

  @Prop()
  fromTime?: string;

  @Prop()
  toTime?: string;

  @Prop()
  timeZoneOffset?: string;
}

export const TimeInfoSchema = SchemaFactory.createForClass(TimeInfoDocument);
