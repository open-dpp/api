import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  create(createOrganizationDto: CreateOrganizationDto) {
    return this.organizationRepository.save({
      name: createOrganizationDto.name,
    });
  }

  join(organization: Organization, user: User) {
    if (organization.users === undefined) {
      organization.users = [];
    }
    if (!organization.users.some((u) => u.id === user.id)) {
      organization.users = [...organization.users, user];
    }

    return this.organizationRepository.save(organization);
  }

  save(organization: Organization) {
    return this.organizationRepository.save(organization);
  }

  findAll() {
    return this.organizationRepository.find();
  }

  findOne(id: string) {
    return this.organizationRepository.findOne({
      where: { id },
      relations: { users: true },
    });
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationRepository.update(id, {
      name: updateOrganizationDto.name,
    });
  }

  remove(id: string) {
    return this.organizationRepository.delete(id);
  }
}
