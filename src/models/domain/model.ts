import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';
import { randomUUID } from 'crypto';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { Organization } from '../../organizations/domain/organization';
import { User } from '../../users/domain/user';
import { Passport } from '../../passport/passport';

export class Model extends Passport {
  @Expose()
  name: string;
  @Expose()
  description: string | undefined;

  @Expose()
  @Type(() => UniqueProductIdentifier)
  readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [];

  @Expose()
  readonly id: string = randomUUID();

  @Expose({ name: 'ownedByOrganizationId' })
  private _ownedByOrganizationId: string | undefined;

  @Expose({ name: 'createdByUserId' })
  private _createdByUserId: string | undefined;

  readonly createdAt: Date | undefined;

  static create(data: {
    name: string;
    user: User;
    organization: Organization;
  }) {
    return Model.fromPlain({
      name: data.name,
      ownedByOrganizationId: data.organization.id,
      createdByUserId: data.user.id,
    });
  }

  static fromPlain<V>(plain: V) {
    return plainToInstance(Model, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
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
