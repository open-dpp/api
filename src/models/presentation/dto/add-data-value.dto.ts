import { z } from 'zod/v4';

export const AddDataValueDtoSchema = z.object({
  row: z.int(),
  value: z.unknown(),
  dataSectionId: z.uuid(),
  dataFieldId: z.uuid(),
});

export type AddDataValueDto = z.infer<typeof AddDataValueDtoSchema>;
