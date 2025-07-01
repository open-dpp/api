import { z } from 'zod/v4';
import { SectionLayoutDtoSchema } from '../../../data-modelling/presentation/dto/layout.dto';

export const UpdateSectionDraftDtoSchema = z.object({
  name: z.string().min(1),
  layout: SectionLayoutDtoSchema,
});

export type UpdateSectionDraftDto = z.infer<typeof UpdateSectionDraftDtoSchema>;
