import { z } from 'zod/v4';
import { LayoutDtoSchema } from '../../../data-modelling/presentation/dto/layout.dto';

export const UpdateDataFieldDraftDtoSchema = z.object({
  name: z.string().min(1),
  options: z.record(z.string(), z.unknown()).optional(),
  layout: LayoutDtoSchema,
});

export type UpdateDataFieldDraftDto = z.infer<
  typeof UpdateDataFieldDraftDtoSchema
>;
