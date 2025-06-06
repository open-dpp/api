import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { Organization } from '../../organizations/domain/organization';
import { User } from '../../users/domain/user';
import { DataValue, Passport } from '../../passport/passport';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export class Model extends Passport {
  granularityLevel = GranularityLevel.MODEL;
  name: string;
  description: string | undefined;

  readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [];

  readonly id: string;

  private _ownedByOrganizationId: string;

  private _createdByUserId: string;

  private constructor(
    id: string,
    name: string,
    ownedByOrganizationId: string,
    createdByUserId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
    productDataModelId: string | undefined,
    dataValues: DataValue[],
    description: string | undefined,
  ) {
    super(productDataModelId, dataValues);
    this.id = id;
    this.name = name;
    this._ownedByOrganizationId = ownedByOrganizationId;
    this._createdByUserId = createdByUserId;
    this.uniqueProductIdentifiers = uniqueProductIdentifiers;
    this.description = description;
  }

  static create(data: {
    name: string;
    user: User;
    organization: Organization;
    description?: string;
  }) {
    return new Model(
      randomUUID(),
      data.name,
      data.organization.id,
      data.user.id,
      [],
      undefined,
      [],
      data.description,
    );
  }

  static loadFromDb(data: {
    id: string;
    name: string;
    ownedByOrganizationId: string;
    createdByUserId: string;
    uniqueProductIdentifiers: UniqueProductIdentifier[];
    productDataModelId: string | undefined;
    dataValues: DataValue[];
    description: string | undefined;
  }) {
    return new Model(
      data.id,
      data.name,
      data.ownedByOrganizationId,
      data.createdByUserId,
      data.uniqueProductIdentifiers,
      data.productDataModelId,
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

  public get createdByUserId() {
    return this._createdByUserId;
  }

  public get ownedByOrganizationId() {
    return this._ownedByOrganizationId;
  }

  public isOwnedBy(organization: Organization) {
    return this._ownedByOrganizationId === organization.id;
  }

  public createUniqueProductIdentifier() {
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(this.id);
    this.uniqueProductIdentifiers.push(uniqueProductIdentifier);
    return uniqueProductIdentifier;
  }
}
