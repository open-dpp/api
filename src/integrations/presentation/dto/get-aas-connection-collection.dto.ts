import { z } from 'zod/v4';

export const GetAasConnectionCollectionSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
  })
  .array();
