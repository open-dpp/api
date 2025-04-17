import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  InstanceDataDocument,
  InstanceDataSchema,
} from './InstanceData.document';
import { IdentifierTypeEnum } from '../domain/enums/IdentifierTypeEnum';
import { IdentifierSyntaxEnum } from '../domain/enums/IdentifierSyntaxEnum';

/**
 * IdentifiersNodeDocument schema
 */
@Schema()
export class IdentifiersNodeDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  identifiersId: number;

  @Prop({
    type: String,
    enum: Object.values(IdentifierTypeEnum),
    required: true,
  })
  identifierType: IdentifierTypeEnum;

  @Prop({
    type: String,
    enum: Object.values(IdentifierTypeEnum),
    required: true,
  })
  instanceType: IdentifierTypeEnum;

  @Prop({ type: InstanceDataSchema, required: true })
  instanceData: InstanceDataDocument;

  @Prop({
    type: String,
    enum: Object.values(IdentifierSyntaxEnum),
    required: true,
  })
  objectIdentifierSyntax: IdentifierSyntaxEnum;
}

export const IdentifiersNodeSchema = SchemaFactory.createForClass(
  IdentifiersNodeDocument,
);
