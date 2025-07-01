import { z } from 'zod/v4';
import { DataFieldBase, DataFieldType } from '../../domain/data-field-base';
import { LayoutDtoSchema, layoutToDto } from './layout.dto';
import { GranularityLevel } from '../../domain/granularity-level';

export const DataFieldBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  type: z.enum(DataFieldType),
  options: z.record(z.string(), z.unknown()).optional(),
  layout: LayoutDtoSchema,
  granularityLevel: z.enum(GranularityLevel),
});

export function dataFieldToDto(dataField: DataFieldBase) {
  return DataFieldBaseSchema.parse({
    id: dataField.id,
    name: dataField.name,
    type: dataField.type,
    options: dataField.options,
    layout: layoutToDto(dataField.layout),
    granularityLevel: dataField.granularityLevel,
  });
}
