import { VisibilityLevel } from '../../../product-data-model/domain/product.data.model';
import { z } from 'zod/v4';
import { Sector } from '@open-dpp/api-client';

export const PublishDtoSchema = z.discriminatedUnion('visibility', [
  z.object({
    visibility: z.literal(VisibilityLevel.PRIVATE),
  }),
  z.object({
    visibility: z.literal(VisibilityLevel.PUBLIC),
    sectors: z.enum(Sector).array(),
  }),
]);

export type PublishDto = z.infer<typeof PublishDtoSchema>;
