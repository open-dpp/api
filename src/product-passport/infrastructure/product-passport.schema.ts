import { Prop } from '@nestjs/mongoose';
import { Document, Schema } from 'mongoose';
import { DataValueDoc, DataValueSchema } from './data-value.schema';

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

export function createCommonIndexesForPassportDoc(schema: Schema) {
  schema.index({ ownedByOrganizationId: 1 });
}
