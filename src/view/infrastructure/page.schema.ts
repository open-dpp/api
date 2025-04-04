import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { BlockType } from '../domain/block';
import { Document } from 'mongoose';

@Schema({ discriminatorKey: 'type' }) // No separate _id for embedded documents
export class BlockDoc {
  @Prop({ required: true })
  _id: string;
}

export const BlockSchema = SchemaFactory.createForClass(BlockDoc);

@Schema()
export class GridDoc extends BlockDoc {
  @Prop({ required: true })
  cols: number;

  @Prop({ type: [BlockSchema], default: [] })
  items: BlockDoc[];
}

export const GridSchema = SchemaFactory.createForClass(GridDoc);

@Schema({ collection: 'pages' })
export class PageDoc extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  version: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [BlockSchema], default: [] })
  blocks: BlockDoc[];
}

export const PageSchema = SchemaFactory.createForClass(PageDoc);
