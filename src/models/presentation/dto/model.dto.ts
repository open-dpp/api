import { UniqueProductIdentifierDtoSchema } from '../../../unique-product-identifier/presentation/dto/unique-product-identifier-dto.schema';
import { z } from 'zod/v4';
import { Model } from '../../domain/model';

export const DataValueDtoSchema = z.object({
  id: z.uuid(),
  row: z.number().optional(),
  value: z.unknown(),
  dataSectionId: z.uuid(),
  dataFieldId: z.uuid(),
});

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
    dataValues: model.dataValues,
    owner: model.createdByUserId,
    uniqueProductIdentifiers: model.uniqueProductIdentifiers.map((u) => ({
      uuid: u.uuid,
      referenceId: u.referenceId,
    })),
    productDataModelId: model.productDataModelId,
  });
}
