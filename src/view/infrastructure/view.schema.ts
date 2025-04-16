import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NodeType, Node, Breakpoints } from '../domain/node';

@Schema({ _id: false })
export class SizeDoc {
  @Prop({ required: true, enum: Breakpoints })
  breakpoint: Breakpoints;

  @Prop({ required: true })
  colSpan: number;
}

const SizeSchema = SchemaFactory.createForClass(SizeDoc);

@Schema({ discriminatorKey: 'type' })
export class NodeDoc {
  @Prop({ required: true })
  _id: string;
}
const NodeSchema = SchemaFactory.createForClass(NodeDoc);

@Schema()
class GritItemDoc extends NodeDoc {
  @Prop({ type: [SizeSchema], default: [] })
  sizes: SizeDoc;

  @Prop({ type: NodeSchema })
  content: Node;
}

const GridItemSchema = SchemaFactory.createForClass(GritItemDoc);

@Schema()
class GridContainerDoc extends NodeDoc {
  @Prop({ type: [GridItemSchema], default: [] })
  readonly children: GritItemDoc[];
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
