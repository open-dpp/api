import { z } from 'zod/v4';

export const CreateModelDtoSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    templateId: z.string().optional(),
    marketplaceResourceId: z.string().optional(),
  })
  .refine((data) => !!data.templateId || !!data.marketplaceResourceId, {
    message: 'marketplaceResourceId or templateId must be provided',
  })
  .refine((data) => !(data.templateId && data.marketplaceResourceId), {
    message: 'marketplaceResourceId and templateId are mutually exclusive',
  });
export type CreateModelDto = z.infer<typeof CreateModelDtoSchema>;
