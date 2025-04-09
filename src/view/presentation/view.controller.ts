import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { AuthRequest } from '../../auth/auth-request';
import { Organization } from '../../organizations/domain/organization';
import { ViewService } from '../infrastructure/view.service';
import { View } from '../domain/view';
import { ViewDto } from './dto/view.dto';

@Controller('/organizations/:orgaId/views')
export class ViewController {
  constructor(
    private readonly organizationService: OrganizationsService,
    private readonly viewService: ViewService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
    @Body() viewDto: ViewDto,
  ) {
    const organization =
      await this.organizationService.findOneOrFail(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    return (
      await this.viewService.save(
        View.create({ ...viewDto, organization, user: req.authContext.user }),
      )
    ).toPlain();
  }

  @Get(':viewId')
  async get(
    @Param('orgaId') organizationId: string,
    @Param('viewId') viewId: string,
    @Request() req: AuthRequest,
    @Body() viewDto: ViewDto,
  ) {
    const organization =
      await this.organizationService.findOneOrFail(organizationId);
    const view = await this.viewService.findOneOrFail(viewId);
    this.hasPermissionsOrFail(organization, view, req);

    return view.toPlain();
  }

  private hasPermissionsOrFail(
    organization: Organization,
    view: View,
    req: AuthRequest,
  ) {
    if (
      organization === undefined ||
      !organization.isMember(req.authContext.user)
    ) {
      throw new ForbiddenException();
    }
    if (!view.isOwnedBy(organization)) {
      throw new ForbiddenException();
    }
  }
}
