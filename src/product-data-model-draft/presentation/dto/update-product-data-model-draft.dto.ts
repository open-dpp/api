import { z } from 'zod/v4';

export const UpdateProductDataModelDraftDtoSchema = z.object({
  name: z.string().min(1),
});

export type UpdateProductDataModelDraftDto = z.infer<
  typeof UpdateProductDataModelDraftDtoSchema
>;
