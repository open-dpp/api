import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { DataFieldType } from '../domain/data-field-base';
import { SectionType } from '../domain/section-base';
import { LayoutDoc, LayoutSchema } from './layout.schema';

@Schema()
class DataFieldDoc {
  @Prop({ required: true })
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, enum: DataFieldType })
  type: DataFieldType;
  @Prop({ required: true, type: MongooseSchema.Types.Mixed }) // Accepts any JSON object
  options: Record<string, unknown>;
  @Prop({ required: true, type: LayoutSchema })
  layout: LayoutDoc;
}
const DataFieldSchema = SchemaFactory.createForClass(DataFieldDoc);

@Schema()
class SectionDoc {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: SectionType })
  type: SectionType;
  @Prop({ type: [DataFieldSchema], default: [] })
  dataFields: DataFieldDoc[];

  @Prop({ required: false })
  parentId?: string;

  @Prop({ default: [] })
  subSections: string[];
  @Prop({ required: true, type: LayoutSchema })
  layout: LayoutDoc[];
}
const SectionSchema = SchemaFactory.createForClass(SectionDoc);

export abstract class ProductDataModelBaseDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  version: string;

  @Prop({ type: [SectionSchema], default: [] })
  sections: SectionDoc[];

  @Prop({ required: true })
  createdByUserId: string;

  @Prop({ required: true })
  ownedByOrganizationId: string;
}
