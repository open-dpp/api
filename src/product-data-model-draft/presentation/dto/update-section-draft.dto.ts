import { z } from 'zod/v4';
import { SectionLayoutDtoSchema } from '../../../data-modelling/presentation/dto/layout.dto';

export const UpdateSectionDraftDtoSchema = z.object({
  name: z.string().nonempty(),
  layout: SectionLayoutDtoSchema,
});

export type UpdateSectionDraftDto = z.infer<typeof UpdateSectionDraftDtoSchema>;
