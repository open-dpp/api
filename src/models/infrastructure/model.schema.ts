import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  createCommonIndexesForPassportDoc,
  PassportDoc,
} from '../../product-passport/infrastructure/product-passport.schema';

export enum ModelDocSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema({ collection: 'models', timestamps: true })
export class ModelDoc extends PassportDoc {
  @Prop({ required: true })
  name: string;

  @Prop({
    default: ModelDocSchemaVersion.v1_0_0,
    enum: ModelDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ModelDocSchemaVersion;

  @Prop({ required: false })
  description?: string;
}
export const ModelSchema = SchemaFactory.createForClass(ModelDoc);

createCommonIndexesForPassportDoc(ModelSchema);
