import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UniqueProductIdentifierCreatedEventDocument } from './open-dpp-events/unique-product-identifier-created.event-document';
import { HydratedDocument, Types } from 'mongoose';

export enum OpenDppEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

/**
 * OpenDppEvent schema
 */
@Schema()
export class OpenDppEventClass {
  @Prop({ required: true })
  _id: string;

  @Prop({
    default: OpenDppEventSchemaVersion.v1_0_0,
    enum: OpenDppEventSchemaVersion,
  })
  _schemaVersion: OpenDppEventSchemaVersion;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ type: UniqueProductIdentifierCreatedEventDocument })
  data: UniqueProductIdentifierCreatedEventDocument;
}

export const OpenDppEventSchema =
  SchemaFactory.createForClass(OpenDppEventClass);

export type OpenDppEventOverride = {
  name: Types.DocumentArray<UniqueProductIdentifierCreatedEventDocument>;
};

export type OpenDppEventDocument = HydratedDocument<
  OpenDppEventClass,
  OpenDppEventOverride
>;
