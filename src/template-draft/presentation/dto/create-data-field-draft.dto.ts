import { DataFieldType } from '../../../data-modelling/domain/data-field-base';
import { GranularityLevel } from '../../../data-modelling/domain/granularity-level';
import { z } from 'zod/v4';
import { LayoutDtoSchema } from '../../../data-modelling/presentation/dto/layout.dto';

export const CreateDataFieldDraftSchema = z.object({
  name: z.string().min(1),
  type: z.enum(DataFieldType),
  options: z.record(z.string(), z.unknown()).optional(),
  layout: LayoutDtoSchema,
  granularityLevel: z.enum(GranularityLevel),
});

export type CreateDataFieldDraftDto = z.infer<
  typeof CreateDataFieldDraftSchema
>;
