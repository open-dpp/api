import { CreateModelDtoSchema } from './create-model.dto';
import { z } from 'zod/v4';

export const UpdateModelDtoSchema = CreateModelDtoSchema.partial();

export type UpdateModelDto = z.infer<typeof UpdateModelDtoSchema>;
