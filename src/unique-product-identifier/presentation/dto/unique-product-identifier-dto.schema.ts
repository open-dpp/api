import { z } from 'zod/v4';

export const UniqueProductIdentifierDtoSchema = z.object({
  uuid: z.uuid(),
  referenceId: z.uuid(),
});
