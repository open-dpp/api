import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { ViewService } from '../infrastructure/view.service';
import { View } from '../domain/view';
import { ViewDto } from './dto/view.dto';
import { PermissionsService } from '../../permissions/permissions.service';

@Controller('/organizations/:orgaId/views')
export class ViewController {
  constructor(
    private readonly viewService: ViewService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
    @Body() viewDto: ViewDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    return (
      await this.viewService.save(
        View.create({
          ...viewDto,
          organizationId: organizationId,
          userId: req.authContext.user.id,
        }),
      )
    ).toPlain();
  }

  @Get(':viewId')
  async get(
    @Param('orgaId') organizationId: string,
    @Param('viewId') viewId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const view = await this.viewService.findOneOrFail(viewId);
    if (!view.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }

    return view.toPlain();
  }
}
