import { z } from 'zod/v4';

export const CreateProductDataModelDraftDtoSchema = z.object({
  name: z.string().min(1),
});

export type CreateProductDataModelDraftDto = z.infer<
  typeof CreateProductDataModelDraftDtoSchema
>;
