import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeInfoDocument, TimeInfoSchema } from './TimeInfo.document';
import { ReadPointDocument, ReadPointSchema } from './ReadPoint.document';
import {
  BizTransactionDocument,
  BizTransactionSchema,
} from './BizTransaction.document';
import { PartyDocument, PartySchema } from './Party.document';
import {
  ErrorDeclarationDocument,
  ErrorDeclarationSchema,
} from './ErrorDecleration.document';
import { IdentifierSyntaxEnum } from '../domain/enums/IdentifierSyntaxEnum';
import { EventTypeEnum } from '../domain/enums/EventTypeEnum';
import { RecordTimeOptionEnum } from '../domain/enums/RecordTimeOptionEnum';
import { BusinessStepEnum } from '../domain/enums/BusinessStepEnum';
import { DispositionEnum } from '../domain/enums/DispositionEnum';
import { ActionEnum } from '../domain/enums/ActionEnum';

/**
 * EventInfoDocument schema
 */
@Schema()
export class EventInfoDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: String,
    enum: Object.values(IdentifierSyntaxEnum),
    required: true,
  })
  objectIdentifierSyntax: IdentifierSyntaxEnum;

  @Prop({
    type: String,
    enum: Object.values(IdentifierSyntaxEnum),
    required: true,
  })
  locationPartyIdentifierSyntax: IdentifierSyntaxEnum;

  @Prop()
  dlURL: string;

  @Prop({ default: 0 })
  eventCount: number;

  @Prop({ type: TimeInfoSchema, required: true })
  eventTime: TimeInfoDocument;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  parentIdentifier: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  instanceIdentifier: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  classIdentifier: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  outputInstanceIdentifier: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  outputClassIdentifier: any[];

  @Prop({ type: ReadPointSchema })
  readPoint: ReadPointDocument;

  @Prop({ type: Map, of: MongooseSchema.Types.Mixed })
  bizLocation: Record<string, any>;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  persistentDispositionList: any[];

  @Prop({ type: [BizTransactionSchema] })
  bizTransactions: BizTransactionDocument[];

  @Prop({ type: [PartySchema] })
  sources: PartyDocument[];

  @Prop({ type: [PartySchema] })
  destinations: PartyDocument[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  sensorElementList: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  userExtensions: any[];

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  ilmd: any[];

  @Prop({ type: ErrorDeclarationSchema })
  errorDeclaration: ErrorDeclarationDocument;

  @Prop({
    type: String,
    enum: Object.values(EventTypeEnum),
    required: true,
  })
  eventType: EventTypeEnum;

  @Prop({ default: true })
  ordinaryEvent: boolean;

  @Prop({ default: false })
  eventID: boolean;

  @Prop({
    type: String,
    enum: Object.values(RecordTimeOptionEnum),
    required: true,
  })
  recordTimeOption: RecordTimeOptionEnum;

  @Prop({
    type: String,
    enum: Object.values(BusinessStepEnum),
  })
  businessStep: BusinessStepEnum;

  @Prop({
    type: String,
    enum: Object.values(DispositionEnum),
  })
  disposition: DispositionEnum;

  @Prop({
    type: String,
    enum: Object.values(ActionEnum),
  })
  action: ActionEnum;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  referencedIdentifier: any[];

  @Prop({ type: Map, of: MongooseSchema.Types.Mixed })
  parentReferencedIdentifier: Record<string, any>;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  outputReferencedIdentifier: any[];

  @Prop()
  name: string;

  @Prop()
  description: string;
}

export const EventInfoSchema = SchemaFactory.createForClass(EventInfoDocument);
