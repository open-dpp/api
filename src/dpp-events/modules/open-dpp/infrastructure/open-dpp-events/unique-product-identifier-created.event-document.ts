import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UniqueProductIdentifierCreatedEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema()
export class UniqueProductIdentifierCreatedEventDocument extends Document {
  @Prop({ required: true })
  readonly uniqueProductIdentifierId: string;

  @Prop({ required: true })
  readonly schemaVersion?: UniqueProductIdentifierCreatedEventSchemaVersion;

  static create(plain: {
    uniqueProductIdentifierId: string;
    schemaVersion?: UniqueProductIdentifierCreatedEventSchemaVersion;
  }) {
    return UniqueProductIdentifierCreatedEventDocument.fromPlain({
      ...plain,
    });
  }

  static fromPlain(
    plain: unknown,
  ): UniqueProductIdentifierCreatedEventDocument {
    return plainToInstance(UniqueProductIdentifierCreatedEventDocument, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}

export const UniqueProductIdentifierCreatedEventSchema =
  SchemaFactory.createForClass(UniqueProductIdentifierCreatedEventDocument);
