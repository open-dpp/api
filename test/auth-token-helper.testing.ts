import { Organization } from '../src/organizations/domain/organization';
import { KeycloakAuthTestingGuard } from './keycloak-auth.guard.testing';
import { User } from '../src/users/domain/user';

const getKeycloakAuthToken = (
  user: User,
  organizations: Organization[],
  keycloakAuthTestingGuard: KeycloakAuthTestingGuard,
) => {
  const organizationsString = `[${organizations.map((organization) => organization.id).join(',')}]`;
  const token = Buffer.from(organizationsString).toString('base64');
  keycloakAuthTestingGuard.tokenToUserMap.set(token, user);
  return `Bearer ${token}`;
};

export default getKeycloakAuthToken;
