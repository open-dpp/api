import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

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

  findAll() {
    return this.organizationRepository.find();
  }

  findOne(id: string) {
    return this.organizationRepository.findOne({ where: { id } });
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
