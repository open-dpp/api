import { z } from 'zod/v4';
import { UniqueProductIdentifier } from '../../domain/unique.product.identifier';
import { GranularityLevel } from '../../../data-modelling/domain/granularity-level';

export const UniqueProductIdentifierDtoSchema = z.object({
  uuid: z.string(),
  referenceId: z.uuid(),
});

export const UniqueProductIdentifierWithGranularityDtoSchema = z.object({
  uuid: z.string(),
  referenceId: z.uuid(),
  granularityLevel: z.enum(GranularityLevel),
});

export function uniqueProductIdentifierToDto(
  uniqueProductIdentifier: UniqueProductIdentifier,
) {
  return UniqueProductIdentifierDtoSchema.parse({
    uuid: uniqueProductIdentifier.uuid,
    referenceId: uniqueProductIdentifier.referenceId,
  });
}
