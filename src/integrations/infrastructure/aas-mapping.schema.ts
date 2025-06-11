import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PassportDoc } from '../../passport/infrastructure/passport.schema';

@Schema({ _id: false })
export class AasFieldMappingDoc {
  @Prop({ required: true })
  sectionId: string;
  @Prop({ required: true })
  dataFieldId: string;
  @Prop({ required: true })
  idShortParent: string;
  @Prop({ required: true })
  idShort: string;
}

export const AasFieldMappingSchema =
  SchemaFactory.createForClass(AasFieldMappingDoc);

export enum AasMappingDocSchemaVersion {
  v1_0_0 = '1.0.0',
}

@Schema({ collection: 'aas_mapping', timestamps: true })
export class AasMappingDoc extends PassportDoc {
  @Prop({ required: true })
  _id: string;
  @Prop({
    default: AasMappingDocSchemaVersion.v1_0_0,
    enum: AasMappingDocSchemaVersion,
  }) // Track schema version
  _schemaVersion: AasMappingDocSchemaVersion;
  @Prop({ type: String, required: true })
  dataModelId: string;

  @Prop({ type: [AasFieldMappingSchema], default: [] })
  fieldMappings: AasFieldMappingDoc[];
}
export const AasMappingSchema = SchemaFactory.createForClass(AasMappingDoc);
