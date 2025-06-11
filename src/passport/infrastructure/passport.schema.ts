import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class DataValueDoc {
  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  value?: unknown;
  @Prop({ required: true, default: 0 })
  row: number;
  @Prop({ required: true })
  dataSectionId: string;
  @Prop({ required: true })
  dataFieldId: string;
}

export const DataValueSchema = SchemaFactory.createForClass(DataValueDoc);

export abstract class PassportDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  createdByUserId: string;

  @Prop({ required: true })
  ownedByOrganizationId: string;

  @Prop({ type: [DataValueSchema], default: [] })
  dataValues: DataValueDoc[];

  @Prop({ required: false })
  productDataModelId?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}
