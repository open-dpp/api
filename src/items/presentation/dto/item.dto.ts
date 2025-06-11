import { z } from 'zod/v4';
import { UniqueProductIdentifierDtoSchema } from '../../../unique-product-identifier/presentation/dto/unique-product-identifier-dto.schema';
import { Item } from '../../domain/item';
import {
  DataValueDtoSchema,
  dataValueToDto,
} from '../../../passport/presentation/dto/data-value.dto';

export const ItemDtoSchema = z.object({
  id: z.uuid(),
  uniqueProductIdentifiers: UniqueProductIdentifierDtoSchema.array(),
  productDataModelId: z.uuid().optional(),
  dataValues: DataValueDtoSchema.array(),
});

export type ItemDto = z.infer<typeof ItemDtoSchema>;

export function itemToDto(item: Item): ItemDto {
  return ItemDtoSchema.parse({
    id: item.id,
    uniqueProductIdentifiers: item.uniqueProductIdentifiers.map((u) => ({
      uuid: u.uuid,
      referenceId: u.referenceId,
    })),
    productDataModelId: item.productDataModelId,
    dataValues: item.dataValues.map((d) => dataValueToDto(d)),
  });
}
