import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Node, NodeType } from '../domain/node';

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
}
const NodeSchema = SchemaFactory.createForClass(NodeDoc);

@Schema()
class GritItemDoc extends NodeDoc {
  @Prop({ required: true, type: ResponsiveConfigSchema })
  colSpan: ResponsiveConfigDoc;

  @Prop({ type: ResponsiveConfigSchema })
  colStart?: ResponsiveConfigDoc;

  @Prop({ type: ResponsiveConfigSchema })
  rowStart?: ResponsiveConfigDoc;

  @Prop({ type: ResponsiveConfigSchema })
  rowSpan?: ResponsiveConfigDoc;

  @Prop({ type: NodeSchema })
  content: Node;
}

const GridItemSchema = SchemaFactory.createForClass(GritItemDoc);

@Schema()
class GridContainerDoc extends NodeDoc {
  @Prop({ type: [GridItemSchema], default: [] })
  readonly children: GritItemDoc[];
  @Prop({ required: true, type: ResponsiveConfigSchema })
  cols: ResponsiveConfigDoc;
}

const GridContainerSchema = SchemaFactory.createForClass(GridContainerDoc);

@Schema()
class SectionGridDoc extends GridContainerDoc {
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
  name: string;
  @Prop({ required: true })
  version: string;
  @Prop({ required: true })
  ownedByOrganizationId: string;
  @Prop({ required: true })
  createdByUserId: string;
  @Prop({ unique: true, required: true })
  dataModelId: string;
  @Prop({ type: [NodeSchema], default: [] })
  nodes: NodeDoc[];
}
const ViewSchema = SchemaFactory.createForClass(ViewDoc);

export function getViewSchema() {
  const schema = ViewSchema;

  // Register base Node schema
  const nodeSchema = NodeSchema;

  // Register discriminators at top level
  nodeSchema.discriminator(NodeType.SECTION_GRID, SectionGridSchema);
  nodeSchema.discriminator(NodeType.GRID_ITEM, GridItemSchema);
  nodeSchema.discriminator(NodeType.GRID_CONTAINER, GridContainerSchema);
  nodeSchema.discriminator(NodeType.SECTION_GRID, SectionGridSchema);
  nodeSchema.discriminator(NodeType.DATA_FIELD_REF, DataFieldRefSchema);

  GridItemSchema.path('content', nodeSchema); // recursive discriminator injection

  // Replace schema path in View too
  schema.path('nodes', [nodeSchema]);

  return schema;
}
