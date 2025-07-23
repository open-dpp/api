import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { ProductPassport } from '../../product-passport/domain/product-passport';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';

type ModelCreateProps = {
  name: string;
  userId: string;
  organizationId: string;
  description?: string;
};

type ModelDbProps = ModelCreateProps & {
  id: string;
  uniqueProductIdentifiers: UniqueProductIdentifier[];
  templateId: string;
  dataValues: DataValue[];
  description: string | undefined;
};

export class Model extends ProductPassport {
  granularityLevel = GranularityLevel.MODEL;
  name: string;
  description: string | undefined;

  private constructor(
    id: string,
    name: string,
    ownedByOrganizationId: string,
    createdByUserId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
    templateId: string | undefined,
    dataValues: DataValue[],
    description: string | undefined,
  ) {
    super(
      id,
      ownedByOrganizationId,
      createdByUserId,
      uniqueProductIdentifiers,
      templateId,
      dataValues,
    );
    this.name = name;
    this.description = description;
  }

  static create(data: ModelCreateProps) {
    return new Model(
      randomUUID(),
      data.name,
      data.organizationId,
      data.userId,
      [],
      undefined,
      [],
      data.description,
    );
  }

  static loadFromDb(data: ModelDbProps) {
    return new Model(
      data.id,
      data.name,
      data.organizationId,
      data.userId,
      data.uniqueProductIdentifiers,
      data.templateId,
      data.dataValues,
      data.description,
    );
  }

  rename(name: string) {
    this.name = name;
  }

  modifyDescription(description: string | undefined) {
    this.description = description;
  }
}
