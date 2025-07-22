import { z } from 'zod/v4';
import { Sector } from '@open-dpp/api-client';

export const CreateProductDataModelDraftDtoSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  sectors: z.enum(Sector).array(),
});

export type CreateProductDataModelDraftDto = z.infer<
  typeof CreateProductDataModelDraftDtoSchema
>;
