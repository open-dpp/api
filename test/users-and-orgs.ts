import { Organization } from '../src/organizations/domain/organization';
import { User } from '../src/users/domain/user';

const user1org1 = {
  id: 'user1org1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  emailVerified: true,
  username: 'johndoe',
};
const user2org1 = {
  id: 'user2org1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  emailVerified: true,
  username: 'janesmith',
};
const user1org2 = {
  id: 'user1org2',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  emailVerified: true,
  username: 'janesmith',
};
const keycloakUsers = [user1org1, user2org1, user1org2];

const org1 = Organization.fromPlain({
  id: 'org1',
  name: 'Organization 1',
  members: [user1org1, user2org1].map((user) => new User(user.id, user.email)),
  createdByUserId: user1org1.id,
  ownedByUserId: user1org1.id,
});

const organizations = [org1];

export { keycloakUsers, organizations, org1, user1org1, user2org1, user1org2 };
