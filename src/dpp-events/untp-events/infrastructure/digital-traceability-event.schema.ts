import {
  CredentialIssuerDoc,
  CredentialIssuerSchema,
} from './credential-issuer.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventDoc, EventSchema } from './event.schema';

/**
 * DigitalTraceabilityEvent schema representing a verifiable credential for traceability events
 */
@Schema()
export class DigitalTraceabilityEventDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: 'array',
    default: ['DigitalTraceabilityEvent', 'VerifiableCredential'],
  })
  type: string[];

  @Prop({
    type: 'array',
    default: [
      'https://www.w3.org/ns/credentials/v2',
      'https://test.uncefact.org/vocabulary/untp/dte/0.5.0/',
    ],
  })
  '@context': string[];

  @Prop({ type: CredentialIssuerSchema })
  issuer: CredentialIssuerDoc;

  @Prop({
    type: 'date',
    nullable: true,
  })
  validFrom?: Date;

  @Prop({
    type: [EventSchema],
    default: [],
  })
  credentialSubject: EventDoc[];
}

export const DigitalTraceabilityEventSchema = SchemaFactory.createForClass(
  DigitalTraceabilityEventDoc,
);
