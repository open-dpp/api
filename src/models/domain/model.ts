import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { Expose, Type } from 'class-transformer';
import { Organization } from '../../organizations/domain/organization';
import { User } from '../../users/domain/user';
import { DataValue, Passport } from '../../passport/passport';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export class Model extends Passport {
  granularityLevel = GranularityLevel.MODEL;
  @Expose()
  name: string;
  @Expose()
  description: string | undefined;

  @Expose()
  @Type(() => UniqueProductIdentifier)
  readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [];

  @Expose()
  readonly id: string;

  @Expose({ name: 'ownedByOrganizationId' })
  private _ownedByOrganizationId: string;

  @Expose({ name: 'createdByUserId' })
  private _createdByUserId: string;

  readonly createdAt: Date | undefined;

  private constructor(
    id: string,
    name: string,
    ownedByOrganizationId: string,
    createdByUserId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
    productDataModelId: string | undefined,
    dataValues: DataValue[],
    description: string | undefined,
    createdAt: Date | undefined,
  ) {
    super(productDataModelId, dataValues);
    this.id = id;
    this.name = name;
    this._ownedByOrganizationId = ownedByOrganizationId;
    this._createdByUserId = createdByUserId;
    this.uniqueProductIdentifiers = uniqueProductIdentifiers;
    this.description = description;
    this.createdAt = createdAt;
  }

  static create(
    name: string,
    user: User,
    organization: Organization,
    description?: string,
  ) {
    return new Model(
      randomUUID(),
      name,
      organization.id,
      user.id,
      [],
      undefined,
      [],
      description,
      undefined,
    );
  }

  static fromPlain(
    id: string,
    name: string,
    ownedByOrganizationId: string,
    createdByUserId: string,
    uniqueProductIdentifiers: UniqueProductIdentifier[],
    productDataModelId: string | undefined,
    dataValues: DataValue[],
    description: string | undefined,
    createdAt: Date | undefined,
  ) {
    return new Model(
      id,
      name,
      ownedByOrganizationId,
      createdByUserId,
      uniqueProductIdentifiers,
      productDataModelId,
      dataValues,
      description,
      createdAt,
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
  toPlain() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dataValues: this.dataValues,
      createdByUserId: this.createdByUserId,
      ownedByOrganizationId: this.ownedByOrganizationId,
      uniqueProductIdentifiers: this.uniqueProductIdentifiers.map((u) =>
        u.toPlain(),
      ),
      granularityLevel: this.granularityLevel,
      productDataModelId: this.productDataModelId,
    };
  }
}
