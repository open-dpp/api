import { z } from 'zod/v4';
import { DataValue } from '../../domain/passport';

const DataValueBaseDtoSchema = z.object({
  value: z.unknown(),
  dataSectionId: z.uuid(),
  dataFieldId: z.uuid(),
});

export const DataValueDtoSchema = DataValueBaseDtoSchema.extend({
  row: z.number().optional(),
});

export type DataValueDto = z.infer<typeof DataValueDtoSchema>;

export const AddDataValueDtoSchema = DataValueBaseDtoSchema.extend({
  row: z.int(),
});
export type AddDataValueDto = z.infer<typeof AddDataValueDtoSchema>;

export function dataValueToDto(dataValue: DataValue) {
  return DataValueDtoSchema.parse({
    dataFieldId: dataValue.dataFieldId,
    dataSectionId: dataValue.dataSectionId,
    row: dataValue.row,
    value: dataValue.value,
  });
}
