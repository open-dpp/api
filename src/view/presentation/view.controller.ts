import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { ViewService } from '../infrastructure/view.service';
import { View } from '../domain/view';
import { ViewDto } from './dto/view.dto';
import { PermissionsService } from '../../permissions/permissions.service';
import { AddNodeDto, nodeFromDto } from './dto/node.dto';

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

  @Post(':viewId/nodes')
  async addNode(
    @Param('orgaId') organizationId: string,
    @Param('viewId') viewId: string,
    @Request() req: AuthRequest,
    @Body() addCreateDto: AddNodeDto,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const view = await this.viewService.findOneOrFail(viewId);
    if (!view.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
    view.addNode(nodeFromDto(addCreateDto.node), addCreateDto.parentId);

    return (await this.viewService.save(view)).toPlain();
  }

  // @PATCH(':viewId/nodes/')
  // async addNode(
  //   @Param('orgaId') organizationId: string,
  //   @Param('viewId') viewId: string,
  //   @Request() req: AuthRequest,
  //   @Body() addCreateDto: AddNodeDto,
  // ) {
  //   await this.permissionsService.canAccessOrganizationOrFail(
  //     organizationId,
  //     req.authContext,
  //   );
  //   const view = await this.viewService.findOneOrFail(viewId);
  //   if (!view.isOwnedBy(organizationId)) {
  //     throw new ForbiddenException();
  //   }
  //   view.addNode(nodeFromDto(addCreateDto.node), addCreateDto.parentId);
  //
  //   return (await this.viewService.save(view)).toPlain();
  // }

  @Get()
  async filterView(
    @Query('dataModelId') dataModelId: string,
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    const view = await this.viewService.findOneByDataModelIdOrFail(dataModelId);
    if (!view.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }

    return view.toPlain();
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
