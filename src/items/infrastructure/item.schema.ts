import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PassportDoc } from '../../passport/infrastructure/passport.schema';

export enum ItemDocSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema({ collection: 'items', timestamps: true })
export class ItemDoc extends PassportDoc {
  @Prop({
    default: ItemDocSchemaVersion.v1_0_0,
    enum: ItemDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: ItemDocSchemaVersion;
  @Prop({ type: String, required: true })
  modelId: string;
}
export const ItemSchema = SchemaFactory.createForClass(ItemDoc);
