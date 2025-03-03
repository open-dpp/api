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

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

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
  async getMembers(@Param('id') id: string) {
    const organization = await this.findOne(id);
    if (!organization) {
      throw new NotFoundException();
    }
    return organization.members;
  }
}
