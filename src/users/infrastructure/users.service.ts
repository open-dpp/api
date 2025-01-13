import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from '../domain/user';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  convertToDomain(userEntity: UserEntity) {
    return new User(userEntity.id);
  }

  async findOne(id: string) {
    return this.convertToDomain(
      await this.userRepository.findOne({
        where: { id },
      }),
    );
  }
}
