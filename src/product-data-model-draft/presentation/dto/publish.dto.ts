import { VisibilityLevel } from '../../../product-data-model/domain/product.data.model';
import { z } from 'zod/v4';

export const PublishDtoSchema = z.object({
  visibility: z.enum(VisibilityLevel),
});

export type PublishDto = z.infer<typeof PublishDtoSchema>;
