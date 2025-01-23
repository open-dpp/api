import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { Organization } from '../domain/organization';
import { User } from '../../users/domain/user';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
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

  async save(organization: Organization) {
    return this.convertToDomain(
      await this.organizationRepository.save({
        id: organization.id,
        name: organization.name,
        users: organization.members
          ? organization.members.map((u) => this.convertUserToEntity(u))
          : [],
      }),
    );
  }

  async findAll() {
    return (await this.organizationRepository.find()).map((o) =>
      this.convertToDomain(o),
    );
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
