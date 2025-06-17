import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ProductPassport } from './product-passport';
import { randomUUID } from 'crypto';

export class ProductPassportReference {
  private constructor(
    public readonly id: string,
    public readonly referenceId: string,
    public readonly ownedByOrganizationId: string,
    public readonly passportId: string,
    public readonly granularityLevel: GranularityLevel,
  ) {}

  static create(data: {
    referenceId: string;
    organizationId: string;
    passport: ProductPassport;
  }) {
    return new ProductPassportReference(
      randomUUID(),
      data.referenceId,
      data.organizationId,
      data.passport.id,
      data.passport.granularityLevel,
    );
  }

  static loadFromDb(data: {
    id: string;
    referenceId: string;
    organizationId: string;
    passportId: string;
    granularityLevel: GranularityLevel;
  }) {
    return new ProductPassportReference(
      data.id,
      data.referenceId,
      data.organizationId,
      data.passportId,
      data.granularityLevel,
    );
  }
}
