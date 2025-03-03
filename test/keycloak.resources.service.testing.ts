import { Expose, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Organization } from '../src/organizations/domain/organization';

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
  async createGroup(organization: Organization) {
    const group = {
      id: randomUUID(),
      name: organization.name,
      members: organization.members.map((m) => ({ id: m.id, email: m.email })),
    };
    this.groups.push(group);
  }
}
