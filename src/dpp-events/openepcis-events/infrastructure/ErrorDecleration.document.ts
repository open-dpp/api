import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeInfoDocument, TimeInfoSchema } from './TimeInfo.document';
import { DeclarationReason } from '../domain/enums/DeclerationReasonEnum';

/**
 * ErrorDeclarationDocument schema
 */
@Schema()
export class ErrorDeclarationDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: TimeInfoSchema, required: true })
  declarationTime: TimeInfoDocument;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  correctiveIds: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  extensions: any[];

  @Prop({
    type: String,
    enum: Object.values(DeclarationReason),
    required: true,
  })
  declarationReason: DeclarationReason;
}

export const ErrorDeclarationSchema = SchemaFactory.createForClass(
  ErrorDeclarationDocument,
);
