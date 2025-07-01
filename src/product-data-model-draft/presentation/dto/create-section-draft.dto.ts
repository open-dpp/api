import { SectionType } from '../../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../../data-modelling/domain/granularity-level';
import { z } from 'zod/v4';
import { SectionLayoutDtoSchema } from '../../../data-modelling/presentation/dto/layout.dto';

export const CreateSectionDraftDtoSchema = z.object({
  name: z.string().min(1),
  type: z.enum(SectionType),
  parentSectionId: z.string().optional(),
  layout: SectionLayoutDtoSchema,
  granularityLevel: z.enum(GranularityLevel).optional(),
});

export type CreateSectionDraftDto = z.infer<typeof CreateSectionDraftDtoSchema>;
