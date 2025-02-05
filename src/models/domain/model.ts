import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';
import { UniqueProductIdentifier } from '../../unique-product-identifier/domain/unique.product.identifier';

export class Model {
  constructor(
    public readonly id: string = randomUUID(),
    public name: string,
    public description: string,
    public readonly uniqueProductIdentifiers: UniqueProductIdentifier[] = [],
    public owner?: string,
    public readonly createdAt?: Date,
  ) {}

  public isOwnedBy(user: User) {
    return this.owner === user.id;
  }

  public assignOwner(user: User) {
    this.owner = user.id;
  }

  public createUniqueProductIdentifier() {
    const uniqueProductIdentifier = new UniqueProductIdentifier();
    uniqueProductIdentifier.linkTo(this.id);
    this.uniqueProductIdentifiers.push(uniqueProductIdentifier);
    return uniqueProductIdentifier;
  }
}
