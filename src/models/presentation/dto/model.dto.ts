import {
  UniqueProductIdentifierDtoSchema,
  uniqueProductIdentifierToDto,
} from '../../../unique-product-identifier/presentation/dto/unique-product-identifier-dto.schema';
import { z } from 'zod/v4';
import { Model } from '../../domain/model';
import {
  DataValueDtoSchema,
  dataValueToDto,
} from '../../../product-passport/presentation/dto/data-value.dto';

export const ModelDtoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  uniqueProductIdentifiers: UniqueProductIdentifierDtoSchema.array(),
  productDataModelId: z.uuid().optional(),
  dataValues: DataValueDtoSchema.array(),
  owner: z.uuid(),
});

export type ModelDto = z.infer<typeof ModelDtoSchema>;

export function modelToDto(model: Model): ModelDto {
  return ModelDtoSchema.parse({
    id: model.id,
    name: model.name,
    description: model.description,
    dataValues: model.dataValues.map((d) => dataValueToDto(d)),
    owner: model.createdByUserId,
    uniqueProductIdentifiers: model.uniqueProductIdentifiers.map((u) =>
      uniqueProductIdentifierToDto(u),
    ),
    productDataModelId: model.productDataModelId,
  });
}
