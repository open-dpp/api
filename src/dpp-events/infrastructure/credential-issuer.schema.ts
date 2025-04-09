import { IdentifierDoc, IdentifierSchema } from './identifier.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * CredentialIssuer schema representing the issuer of a verifiable credential
 */
@Schema()
export class CredentialIssuerDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: 'array',
    default: ['CredentialIssuer'],
  })
  type: string[];

  @Prop()
  name: string;

  @Prop({
    type: [IdentifierSchema],
    default: [],
  })
  otherIdentifier?: IdentifierDoc[];
}

export const CredentialIssuerSchema =
  SchemaFactory.createForClass(CredentialIssuerDoc);
