import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { OrganizationsService } from '../infrastructure/organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from '../domain/organization';
import { HasPermissions } from '../../auth/permissions/permissions.decorator';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { AuthRequest } from '../../auth/auth-request';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly keycloakResourcesService: KeycloakResourcesService,
  ) {}

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
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    // check permission
    const allowed =
      req.authContext.permissions.find(
        (per) =>
          per.rsname === 'organization-' + id &&
          per.scopes.includes('organization:read'),
      ) !== undefined;
    return this.organizationsService.findOne(id);
  }
}
