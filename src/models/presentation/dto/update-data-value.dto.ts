import { z } from 'zod/v4';

export const UpdateDataValueDtoSchema = z.object({
  id: z.string(),
  value: z.unknown(),
});

export type UpdateDataValueDto = z.infer<typeof UpdateDataValueDtoSchema>;
