import { z } from 'zod/v4';
import { Layout, ResponsiveConfigSchema } from '../../domain/layout';

export const LayoutDtoSchema = z.object({
  colStart: ResponsiveConfigSchema,
  colSpan: ResponsiveConfigSchema,
  rowStart: ResponsiveConfigSchema,
  rowSpan: ResponsiveConfigSchema,
});

export type LayoutDto = z.infer<typeof LayoutDtoSchema>;

export const SectionLayoutDtoSchema = LayoutDtoSchema.extend({
  cols: ResponsiveConfigSchema,
});

export type SectionLayoutDto = z.infer<typeof SectionLayoutDtoSchema>;

export function layoutToDto(layout: Layout): LayoutDto | SectionLayoutDto {
  const shared = {
    colStart: layout.colStart,
    colSpan: layout.colSpan,
    rowStart: layout.rowStart,
    rowSpan: layout.rowSpan,
  };
  return layout.cols
    ? SectionLayoutDtoSchema.parse({ ...shared, cols: layout.cols })
    : LayoutDtoSchema.parse(shared);
}
