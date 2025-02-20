import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { Organization } from '../domain/organization';
import { User } from '../../users/domain/user';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { AuthContext } from '../../auth/auth-request';
import { UsersService } from '../../users/infrastructure/users.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationRepository: Repository<OrganizationEntity>,
    private readonly dataSource: DataSource,
    private readonly keycloakResourcesService: KeycloakResourcesService,
    private readonly usersService: UsersService,
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
      organizationEntity.members
        ? organizationEntity.members.map((u) => new User(u.id, u.email))
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
      const entity: Partial<OrganizationEntity> = {
        id: organization.id,
        name: organization.name,
        members: organization.members
          ? organization.members.map((u) => this.convertUserToEntity(u))
          : [],
        createdByUserId: authContext.user.id,
        ownedByUserId: authContext.user.id,
      };
      const savedEntity = await this.organizationRepository.save(entity);
      await queryRunner.commitTransaction();
      result = this.convertToDomain(savedEntity);
    } catch (err) {
      console.log(err);
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
          members: true,
        },
      })
    ).map((o) => this.convertToDomain(o));
  }

  async findOne(id: string) {
    return this.convertToDomain(
      await this.organizationRepository.findOne({
        where: { id },
        relations: { members: true },
      }),
    );
  }

  async inviteUser(
    authContext: AuthContext,
    organizationId: string,
    email: string,
  ) {
    if (authContext.user.email === email) {
      throw new BadRequestException();
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const org = await this.findOne(organizationId);
    const users = await this.usersService.find({ where: { email } });
    if (users.length === 0) {
      throw new NotFoundException();
    }
    if (users.length > 1) {
      throw new InternalServerErrorException();
    }
    const userToInvite = users[0];
    if (org.members.find((member) => member.id === userToInvite.id)) {
      throw new BadRequestException();
    }
    try {
      org.members.push({ id: userToInvite.id, email: userToInvite.email });
      await this.organizationRepository.save(org);
      /* await this.keycloakResourcesService.inviteUserToGroup(
        authContext,
        'organization-' + organizationId,
        userToInvite.id,
      ); */
    } catch (err) {
      console.log('Error:', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async findAllWhereMember(authContext: AuthContext) {
    return (
      await this.organizationRepository.find({
        where: {
          members: {
            id: authContext.user.id,
          },
        },
        relations: {
          members: true,
        },
      })
    ).map((o) => this.convertToDomain(o));
  }

  async getMembersOfOrganization(id: string) {
    const organization = await this.findOne(id);
    if (!organization) {
      throw new NotFoundException();
    }
    return organization.members;
  }
}
