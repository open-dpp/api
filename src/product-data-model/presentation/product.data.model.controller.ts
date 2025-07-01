import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ProductDataModelService } from '../infrastructure/product-data-model.service';
import { AuthRequest } from '../../auth/auth-request';
import { productDataModelToDto } from './dto/product-data-model.dto';
import { PermissionsService } from '../../permissions/permissions.service';

@Controller('product-data-models')
export class ProductDataModelController {
  constructor(
    private readonly productDataModelService: ProductDataModelService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string, @Request() req: AuthRequest) {
    const found = await this.productDataModelService.findOneOrFail(id);
    if (!found.isPublic()) {
      await this.permissionsService.canAccessOrganizationOrFail(
        found.ownedByOrganizationId,
        req.authContext,
      );
    }

    return productDataModelToDto(found);
  }

  @Get()
  async getAll(
    @Query('organization') organizationId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    return await this.productDataModelService.findAllAccessibleByOrganization(
      organizationId,
    );
  }
}
