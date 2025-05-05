import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ResponsiveConfigDoc {
  @Prop()
  xs?: number;
  @Prop({ required: true })
  sm: number;
  @Prop()
  md?: number;
  @Prop()
  lg?: number;
  @Prop()
  xl?: number;
}

const ResponsiveConfigSchema =
  SchemaFactory.createForClass(ResponsiveConfigDoc);

@Schema({ _id: false })
export class LayoutDoc {
  @Prop({ required: true, type: ResponsiveConfigSchema })
  colSpan: ResponsiveConfigDoc;

  @Prop({ required: true, type: ResponsiveConfigSchema })
  colStart: ResponsiveConfigDoc;

  @Prop({ required: true, type: ResponsiveConfigSchema })
  rowStart: ResponsiveConfigDoc;

  @Prop({ required: true, type: ResponsiveConfigSchema })
  rowSpan: ResponsiveConfigDoc;

  @Prop({ type: ResponsiveConfigSchema })
  cols?: ResponsiveConfigDoc;
}
export const LayoutSchema = SchemaFactory.createForClass(LayoutDoc);
