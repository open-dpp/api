import { Permalink } from '../../permalinks/domain/permalink';
import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';

export class Product {
  constructor(
    public readonly id: string = randomUUID(),
    public name: string,
    public description: string,
    public readonly permalinks: Permalink[] = [],
    public owner?: string,
    public readonly createdAt?: Date,
  ) {}

  public isOwnedBy(user: User) {
    return this.owner === user.id;
  }

  public assignOwner(user: User) {
    this.owner = user.id;
  }

  public createPermalink() {
    const permalink = new Permalink();
    permalink.linkTo(this.id);
    this.permalinks.push(permalink);
    return permalink;
  }
}
