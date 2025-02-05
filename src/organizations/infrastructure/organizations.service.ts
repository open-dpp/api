import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { Organization } from '../domain/organization';
import { User } from '../../users/domain/user';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { AuthContext } from '../../auth/auth-request';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
    private readonly dataSource: DataSource,
    private readonly keycloakResourcesService: KeycloakResourcesService,
  ) {}

  convertUserToEntity(user: User) {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    return userEntity;
  }

  convertToDomain(organizationEntity: OrganizationEntity) {
    return new Organization(
      organizationEntity.id,
      organizationEntity.name,
      organizationEntity.users
        ? organizationEntity.users.map((u) => new User(u.id))
        : [],
    );
  }

  async save(authContext: AuthContext, organization: Organization) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result: Organization | null = null;
    try {
      await this.keycloakResourcesService.createGroup(
        authContext,
        'organization-' + organization.id,
      );
      const entity = await this.organizationRepository.save({
        id: organization.id,
        name: organization.name,
        users: organization.members
          ? organization.members.map((u) => this.convertUserToEntity(u))
          : [],
      });
      await queryRunner.commitTransaction();
      result = this.convertToDomain(entity);
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return result;
  }

  async findAll() {
    return (
      await this.organizationRepository.find({
        relations: {
          users: true,
        },
      })
    ).map((o) => this.convertToDomain(o));
  }

  async findOne(id: string) {
    return this.convertToDomain(
      await this.organizationRepository.findOne({
        where: { id },
        relations: { users: true },
      }),
    );
  }
}
