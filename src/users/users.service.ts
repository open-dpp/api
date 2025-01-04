import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findOneById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  findOne(options: FindOneOptions<User>) {
    return this.userRepository.findOne(options);
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }
}
