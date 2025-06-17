import { z } from 'zod/v4';

export const CreateModelDtoSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type CreateModelDto = z.infer<typeof CreateModelDtoSchema>;
