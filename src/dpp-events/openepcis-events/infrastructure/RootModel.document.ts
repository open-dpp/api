import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EventNodeDocument, EventNodeSchema } from './EventNode.document';
import {
  IdentifiersNodeDocument,
  IdentifiersNodeSchema,
} from './IdentifiersNode.document';
import { ConnectorDocument, ConnectorSchema } from './Connector.document';
import {
  DrawflowInfoDocument,
  DrawflowInfoSchema,
} from './DrawflowInfo.document';

/**
 * RootModelDocument schema
 */
@Schema()
export class RootModelDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: [EventNodeSchema] })
  eventNodeInfo: EventNodeDocument[];

  @Prop({ type: [IdentifiersNodeSchema] })
  identifiersNodeInfo: IdentifiersNodeDocument[];

  @Prop({ type: [ConnectorSchema] })
  connectorsInfo: ConnectorDocument[];

  @Prop({ type: DrawflowInfoSchema, required: true })
  drawflowInfo: DrawflowInfoDocument;
}

export const RootModelSchema = SchemaFactory.createForClass(RootModelDocument);
