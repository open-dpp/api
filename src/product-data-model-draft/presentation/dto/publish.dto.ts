import { z } from 'zod/v4';

export enum VisibilityLevel {
  PRIVATE = 'Private',
  PUBLIC = 'Public',
}

export const PublishDtoSchema = z.object({
  visibility: z.enum(VisibilityLevel),
});

export type PublishDto = z.infer<typeof PublishDtoSchema>;
