import { Organization } from './organization';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

describe('Organization', () => {
  it('adds a user as member', () => {
    const organization = new Organization();
    const user = new User(randomUUID());
    const user2 = new User(randomUUID());
    organization.join(user);
    organization.join(user2);
    organization.join(user);
    expect(organization.members).toEqual([user, user2]);
  });
});
