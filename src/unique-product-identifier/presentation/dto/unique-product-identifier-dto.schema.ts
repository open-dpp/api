import { z } from 'zod/v4';
import { UniqueProductIdentifier } from '../../domain/unique.product.identifier';

export const UniqueProductIdentifierDtoSchema = z.object({
  uuid: z.string(),
  referenceId: z.uuid(),
});

export function uniqueProductIdentifierToDto(
  uniqueProductIdentifier: UniqueProductIdentifier,
) {
  return UniqueProductIdentifierDtoSchema.parse({
    uuid: uniqueProductIdentifier.uuid,
    referenceId: uniqueProductIdentifier.referenceId,
  });
}
