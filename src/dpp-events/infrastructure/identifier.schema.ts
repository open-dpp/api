import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Identifier schema representing various identifiers used in the system
 */
@Schema()
export class IdentifierDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: 'array',
    default: ['Identifier'],
  })
  type: string[];

  // Additional properties would go here based on the full schema definition
}

export const IdentifierSchema = SchemaFactory.createForClass(IdentifierDoc);
