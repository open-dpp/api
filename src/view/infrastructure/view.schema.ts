import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NodeType } from '../domain/node';
import { TargetGroup } from '../domain/view';

@Schema({ _id: false })
export class ResponsiveConfigDoc {
  @Prop()
  xs?: number;
  @Prop()
  sm?: number;
  @Prop()
  md?: number;
  @Prop()
  lg?: number;
  @Prop()
  xl?: number;
}

const ResponsiveConfigSchema =
  SchemaFactory.createForClass(ResponsiveConfigDoc);

@Schema({ discriminatorKey: 'type' })
export class NodeDoc {
  @Prop({ required: true })
  _id: string;
  @Prop({ required: true, type: ResponsiveConfigSchema })
  colSpan: ResponsiveConfigDoc;

  @Prop({ required: true, type: ResponsiveConfigSchema })
  colStart: ResponsiveConfigDoc;

  @Prop({ type: ResponsiveConfigSchema })
  rowStart?: ResponsiveConfigDoc;

  @Prop({ type: ResponsiveConfigSchema })
  rowSpan?: ResponsiveConfigDoc;

  @Prop()
  readonly parentId?: string;

  @Prop({ required: true })
  readonly children: string[];
}
const NodeSchema = SchemaFactory.createForClass(NodeDoc);

@Schema()
class SectionGridDoc extends NodeDoc {
  @Prop({ required: true, type: ResponsiveConfigSchema })
  cols: ResponsiveConfigDoc;
  @Prop({ required: true })
  readonly sectionId: string;
}

const SectionGridSchema = SchemaFactory.createForClass(SectionGridDoc);

@Schema()
class DataFieldRefDoc extends NodeDoc {
  @Prop({ required: true })
  readonly fieldId: string;
}

const DataFieldRefSchema = SchemaFactory.createForClass(DataFieldRefDoc);

@Schema({ collection: 'views' })
export class ViewDoc extends Document {
  @Prop({ required: true })
  _id: string;
  @Prop({ required: true })
  version: string;
  @Prop({ required: true, enum: TargetGroup })
  targetGroup: TargetGroup;
  @Prop({ required: true })
  dataModelId: string;
  @Prop({ type: [NodeSchema], default: [] })
  nodes: NodeDoc[];
}
const ViewSchema = SchemaFactory.createForClass(ViewDoc);

ViewSchema.index({ targetGroup: 1, dataModelId: 1 }, { unique: true });

export function getViewSchema() {
  const schema = ViewSchema;

  // Register base Node schema
  const nodeSchema = NodeSchema;

  // Register discriminators at top level
  nodeSchema.discriminator(NodeType.SECTION_GRID, SectionGridSchema);
  nodeSchema.discriminator(NodeType.DATA_FIELD_REF, DataFieldRefSchema);

  // Replace schema path in View too
  schema.path('nodes', [nodeSchema]);

  return schema;
}
