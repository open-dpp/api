import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from '../domain/user';
import { KeycloakUserInToken } from '../../auth/keycloak-auth/KeycloakUserInToken';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  convertToDomain(userEntity: UserEntity) {
    return new User(userEntity.id, userEntity.email);
  }

  async findOne(id: string) {
    return this.convertToDomain(
      await this.userRepository.findOne({
        where: { id },
      }),
    );
  }

  async find(options?: FindManyOptions<UserEntity>) {
    const entities = await this.userRepository.find(options);
    return entities.map((entity) => this.convertToDomain(entity));
  }

  async create(keycloakUser: KeycloakUserInToken, ignoreIfExists?: boolean) {
    const find = await this.userRepository.findOne({
      where: { id: keycloakUser.sub },
    });
    if (find && !ignoreIfExists) {
      throw new BadRequestException();
    }
    const user = new UserEntity();
    user.id = keycloakUser.sub;
    user.email = keycloakUser.email;
    return this.userRepository.save(user);
  }
}
