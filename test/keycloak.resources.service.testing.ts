import { Expose, plainToInstance } from 'class-transformer';
import { AuthContext } from '../src/auth/auth-request';
import { randomUUID } from 'crypto';

type KeycloakUser = {
  id: string;
  email: string;
};

type KeycloakGroup = {
  id: string;
  name: string;
  members: KeycloakUser[];
};

export class KeycloakResourcesServiceTesting {
  @Expose()
  readonly users: KeycloakUser[] = [];

  readonly groups: KeycloakGroup[] = [];

  static fromPlain(plain: Partial<KeycloakResourcesServiceTesting>) {
    return plainToInstance(KeycloakResourcesServiceTesting, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
  async getUsers() {
    return this.users;
  }
  async createGroup(authContext: AuthContext, groupName: string) {
    const group = {
      id: randomUUID(),
      name: groupName,
      members: [{ id: authContext.user.id, email: authContext.user.email }],
    };
    this.groups.push(group);
  }
}
