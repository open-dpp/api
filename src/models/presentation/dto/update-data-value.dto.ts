import { z } from 'zod/v4';
import { DataValueDtoSchema } from './model.dto';

export const UpdateDataValueDtoSchema = DataValueDtoSchema;
export type UpdateDataValueDto = z.infer<typeof UpdateDataValueDtoSchema>;
