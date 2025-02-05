import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrganizationsService } from '../infrastructure/organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from '../domain/organization';
import { HasPermissions } from '../../auth/permissions/permissions.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    const organization = new Organization(
      undefined,
      createOrganizationDto.name,
      [],
    );
    return this.organizationsService.save(organization);
  }

  @Get()
  @HasPermissions()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @HasPermissions()
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }
}
