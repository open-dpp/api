import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ItemCreatedEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema()
export class ItemCreatedEventDocument extends Document {
  @Prop({ required: true })
  readonly itemId: string;

  @Prop({ required: true })
  readonly schemaVersion?: ItemCreatedEventSchemaVersion;

  static create(plain: {
    itemId: string;
    schemaVersion?: ItemCreatedEventSchemaVersion;
  }) {
    return ItemCreatedEventDocument.fromPlain({
      ...plain,
    });
  }

  static fromPlain(plain: unknown): ItemCreatedEventDocument {
    return plainToInstance(ItemCreatedEventDocument, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}

export const ItemCreatedEventSchema = SchemaFactory.createForClass(
  ItemCreatedEventDocument,
);
