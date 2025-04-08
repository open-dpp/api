import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Node, NodeType } from '../domain/node';

@Schema({ _id: false })
export class BreakpointDoc {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  sizeInPx: number;
}

const BreakPointSchema = SchemaFactory.createForClass(BreakpointDoc);

@Schema({ _id: false })
export class SizeDoc {
  @Prop({ required: true, type: BreakPointSchema })
  breakpoint: BreakpointDoc;

  @Prop({ required: true })
  colSpan: number;
}

const SizeSchema = SchemaFactory.createForClass(SizeDoc);

@Schema({ discriminatorKey: 'type' })
export class NodeDoc {
  @Prop({ required: true })
  _id: string;
  // @Prop({ required: true, enum: NodeType })
  // type: NodeType;
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

@Schema({ collection: 'layouts' })
export class LayoutDoc extends Document {
  @Prop({ required: true })
  _id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ type: [NodeSchema], default: [] })
  nodes: NodeDoc[];
}
const LayoutSchema = SchemaFactory.createForClass(LayoutDoc);

export function getLayoutSchema() {
  const schema = LayoutSchema;

  // Register base Node schema
  const nodeSchema = NodeSchema;

  // Register discriminators at top level
  nodeSchema.discriminator(NodeType.SECTION_GRID, SectionGridSchema);
  nodeSchema.discriminator(NodeType.GRID_ITEM, GridItemSchema);
  nodeSchema.discriminator(NodeType.GRID_CONTAINER, GridContainerSchema);
  nodeSchema.discriminator(NodeType.SECTION_GRID, SectionGridSchema);
  nodeSchema.discriminator(NodeType.DATA_FIELD_REF, DataFieldRefSchema);

  GridItemSchema.path('content', nodeSchema); // recursive discriminator injection

  // Replace schema path in Layout too
  schema.path('nodes', [nodeSchema]);

  return schema;
}
