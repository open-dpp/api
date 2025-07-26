import { z } from 'zod';

export const UpdateTemplateDraftDtoSchema = z.object({
  name: z.string().min(1),
});

export type UpdateTemplateDraftDto = z.infer<
  typeof UpdateTemplateDraftDtoSchema
>;
