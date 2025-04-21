import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UniqueProductIdentifierCreatedEventSchemaVersion {
  v1_0_0 = '1.0.1',
}

@Schema()
export class UniqueProductIdentifierCreatedEventDocument extends Document {
  @Expose()
  readonly uniqueProductIdentifierId: string;

  @Expose()
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
