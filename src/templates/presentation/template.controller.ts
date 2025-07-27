import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Request,
} from '@nestjs/common';
import { TemplateService } from '../infrastructure/template.service';
import { AuthRequest } from '../../auth/auth-request';
import { templateParamDocumentation, templateToDto } from './dto/template.dto';
import { PermissionsService } from '../../permissions/permissions.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  templateDocumentation,
  templateGetAllDocumentation,
} from '../../open-api-docs/template.doc';

@Controller('/organizations/:organizationId/templates')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @ApiOperation({
    summary: 'Find template by id',
    description: 'Find template by id.',
  })
  @ApiParam(templateParamDocumentation)
  @ApiResponse({
    schema: templateDocumentation,
  })
  @Get(':templateId')
  async get(
    @Param('organizationId') organizationId: string,
    @Param('templateId') id: string,
    @Request() req: AuthRequest,
  ) {
    const found = await this.templateService.findOneOrFail(id);

    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );

    if (!found.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }

    return templateToDto(found);
  }

  @ApiOperation({
    summary: 'Find all templates',
    description: "Find all templates which belong to the user's organization.",
  })
  @ApiResponse({
    schema: templateGetAllDocumentation,
  })
  @Get()
  async getAll(
    @Param('organizationId') organizationId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    return await this.templateService.findAllByOrganization(organizationId);
  }
}
