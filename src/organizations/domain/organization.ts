import { randomUUID } from 'crypto';
import { User } from '../../users/domain/user';

export class Organization {
  constructor(
    public readonly id: string = randomUUID(),
    public readonly name: string = '',
    public readonly members: User[] = [],
    public readonly createdByUserId: string = '',
    public readonly ownedByUserId: string = '',
  ) {}

  join(user: User) {
    if (!this.members.find((m) => m.id === user.id)) {
      this.members.push(user);
    }
  }
}
