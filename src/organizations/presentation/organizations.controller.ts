import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { OrganizationsService } from '../infrastructure/organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from '../domain/organization';
import { AuthRequest } from '../../auth/auth-request';
import { PermissionsService } from '../../permissions/permissions.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  create(
    @Request() req: AuthRequest,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    const organization = Organization.create({
      name: createOrganizationDto.name,
      user: req.authContext.user,
    });

    return this.organizationsService.save(organization);
  }

  @Get()
  async findAll(@Request() req: AuthRequest) {
    return (
      await this.organizationsService.findAllWhereMember(req.authContext)
    ).filter((organization) =>
      this.permissionsService.canAccessOrganization(
        organization.id,
        req.authContext,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    await this.permissionsService.canAccessOrganizationOrFail(
      id,
      req.authContext,
    );
    return this.organizationsService.findOneOrFail(id);
  }

  @Post(':organizationId/invite')
  async inviteUser(
    @Request() req: AuthRequest,
    @Param('organizationId') organizationId: string,
    @Body() body: { email: string },
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    return this.organizationsService.inviteUser(
      req.authContext,
      organizationId,
      body.email,
    );
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req: AuthRequest) {
    await this.permissionsService.canAccessOrganizationOrFail(
      id,
      req.authContext,
    );
    const organization = await this.findOne(id, req);
    if (!organization) {
      throw new NotFoundException();
    }
    return organization.members;
  }
}
