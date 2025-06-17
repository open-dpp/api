import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export enum ProductPassportReferenceDocSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema({ collection: 'product_passport_references' })
export class ProductPassportReferenceDoc extends Document {
  @Prop({ required: true })
  _id: string;
  @Prop({
    default: ProductPassportReferenceDocSchemaVersion.v1_0_0,
    enum: ProductPassportReferenceDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ProductPassportReferenceDocSchemaVersion;

  @Prop({ required: true })
  referenceId: string;

  @Prop({ required: true })
  passportId: string;

  @Prop({ required: true, enum: GranularityLevel })
  granularityLevel: GranularityLevel;

  @Prop({ required: true })
  ownedByOrganizationId: string;
}

export const ProductPassportReferenceSchema = SchemaFactory.createForClass(
  ProductPassportReferenceDoc,
);

ProductPassportReferenceSchema.index(
  { referenceId: 1, ownedByOrganizationId: 1 },
  { unique: true },
);
