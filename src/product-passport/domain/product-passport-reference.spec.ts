import { ProductPassportReference } from './product-passport-reference';
import { Item } from '../../items/domain/item';
import { randomUUID } from 'crypto';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

describe('ProductPassportReference', () => {
  it('should be created', () => {
    const item = Item.create({
      organizationId: randomUUID(),
      userId: randomUUID(),
    });
    const referenceId = randomUUID();
    const organizationId = randomUUID();
    const productPassportReference = ProductPassportReference.create({
      referenceId: referenceId,
      passport: item,
      organizationId,
    });
    expect(productPassportReference.referenceId).toEqual(referenceId);
    expect(productPassportReference.passportId).toEqual(item.id);
    expect(productPassportReference.ownedByOrganizationId).toEqual(
      organizationId,
    );
    expect(productPassportReference.granularityLevel).toEqual(
      GranularityLevel.ITEM,
    );
  });
});
