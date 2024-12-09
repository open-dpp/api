import {Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {FindOneOptions, Repository} from "typeorm";
import {User} from "./entities/user.entity";
import {OrganizationsService} from "../organizations/organizations.service";

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly organizationService: OrganizationsService
    ) {
    }

    async create(createUserDto: CreateUserDto) {
        const organization = await this.organizationService.findOne(createUserDto.organization_id);
        return this.userRepository.save({
            keycloakId: createUserDto.keycloakId,
            username: createUserDto.username,
            organizations: [organization]
        });
    }

    findAll() {
        return this.userRepository.find();
    }

    findOneById(id: string) {
        return this.userRepository.findOne({where: {id}});
    }

    findOne(options: FindOneOptions<User>) {
        return this.userRepository.findOne(options);
    }

    update(id: string, updateUserDto: UpdateUserDto) {
        return this.userRepository.update(id, {
            username: updateUserDto.username,
        });
    }

    remove(id: string) {
        return this.userRepository.delete(id);
    }
}
