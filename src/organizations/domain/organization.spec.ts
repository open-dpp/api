import { Organization } from './organization';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';

describe('Organization', () => {
  it('adds a user as member', () => {
    const organization = new Organization();
    const user = new User(randomUUID(), 'test@test.test');
    const user2 = new User(randomUUID(), 'test2@test.test');
    organization.join(user);
    organization.join(user2);
    organization.join(user);
    expect(organization.members).toEqual([user, user2]);
  });
});
