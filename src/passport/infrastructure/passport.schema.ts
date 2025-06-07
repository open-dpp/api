import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class DataValueDoc {
  @Prop({ required: true })
  _id: string;
  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  value?: unknown;
  @Prop({ required: false })
  row?: number;
  @Prop({ required: true })
  dataSectionId: string;
  @Prop({ required: true })
  dataFieldId: string;
}

export const DataValueSchema = SchemaFactory.createForClass(DataValueDoc);

export abstract class PassportDoc extends Document {
  @Prop({ required: true })
  _id: string;
  @Prop({ type: [DataValueSchema], default: [] })
  dataValues: DataValueDoc[];

  @Prop({ required: false })
  productDataModelId?: string;
}
