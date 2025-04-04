import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { AuthRequest } from '../../auth/auth-request';

import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { Page } from '../domain/page';
import { ViewService } from '../infrastructure/view.service';

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
  ) {
    return (
      await this.viewService.save(Page.create({ name: 'Page' }))
    ).toPlain();
  }

  @Post(':viewId/blocks')
  async get(
    @Param('orgaId') organizationId: string,
    @Param('viewId') viewId: string,
    @Request() req: AuthRequest,
  ) {}
}
