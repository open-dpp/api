import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Equal, Repository } from 'typeorm';
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
    userEntity.email = user.email;
    return userEntity;
  }

  convertToDomain(organizationEntity: OrganizationEntity) {
    const members = organizationEntity.members
      ? organizationEntity.members.map((u) => new User(u.id, u.email))
      : [];
    return Organization.fromPlain({
      id: organizationEntity.id,
      name: organizationEntity.name,
      members,
      createdByUserId: organizationEntity.createdByUserId,
      ownedByUserId: organizationEntity.ownedByUserId,
    });
  }

  async save(organization: Organization) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result: Organization | null = null;
    try {
      await this.keycloakResourcesService.createGroup(organization);
      const members: Array<UserEntity> = organization.members.map((u) =>
        this.convertUserToEntity(u),
      );
      const entity: Partial<OrganizationEntity> = {
        id: organization.id,
        name: organization.name,
        members,
        createdByUserId: organization.createdByUserId,
        ownedByUserId: organization.ownedByUserId,
      };
      const savedEntity = await this.organizationRepository.save(entity);
      await queryRunner.commitTransaction();
      result = this.convertToDomain(savedEntity);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
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
      await this.organizationRepository.findOneOrFail({
        where: { id: Equal(id) },
        relations: { members: true, models: true },
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
    const users = await this.usersService.find({
      where: { email: Equal(email) },
    });
    if (users.length > 1) {
      throw new InternalServerErrorException();
    }
    let userToInvite: User | null = null;
    if (users.length === 0) {
      const keycloakUser =
        await this.keycloakResourcesService.findKeycloakUserByEmail(email);
      userToInvite = new User(keycloakUser.id, keycloakUser.email);
    } else if (users.length === 1) {
      userToInvite = users[0];
    }
    if (!userToInvite) {
      throw new NotFoundException(); // TODO: Fix user enumeration
    }
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
          members: Equal({
            id: Equal(authContext.user.id),
          }),
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
