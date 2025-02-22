import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { OrganizationsService } from '../infrastructure/organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from '../domain/organization';
import { AuthRequest } from '../../auth/auth-request';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(
    @Request() req: AuthRequest,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    const organization = new Organization(
      undefined,
      createOrganizationDto.name,
      [],
    );
    return this.organizationsService.save(req.authContext, organization);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.organizationsService.findAllWhereMember(req.authContext);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post(':organizationId/invite')
  inviteUser(
    @Request() req: AuthRequest,
    @Param('organizationId') organizationId: string,
    @Body() body: { email: string },
  ) {
    return this.organizationsService.inviteUser(
      req.authContext,
      organizationId,
      body.email,
    );
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.organizationsService.getMembersOfOrganization(id);
  }
}
