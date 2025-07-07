import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ProductDataModelService } from '../infrastructure/product-data-model.service';
import { AuthRequest } from '../../auth/auth-request';
import {
  productDataModelParamDocumentation,
  productDataModelToDto,
} from './dto/product-data-model.dto';
import { PermissionsService } from '../../permissions/permissions.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  productDataModelDocumentation,
  productDataModelGetAllDocumentation,
} from '../../open-api-docs/product-data-model.doc';

@Controller('product-data-models')
export class ProductDataModelController {
  constructor(
    private readonly productDataModelService: ProductDataModelService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @ApiOperation({
    summary: 'Find product data model by id',
    description: 'Find product data model by id.',
  })
  @ApiParam(productDataModelParamDocumentation)
  @ApiResponse({
    schema: productDataModelDocumentation,
  })
  @Get(':productDataModelId')
  async get(
    @Param('productDataModelId') id: string,
    @Request() req: AuthRequest,
  ) {
    const found = await this.productDataModelService.findOneOrFail(id);
    if (!found.isPublic()) {
      await this.permissionsService.canAccessOrganizationOrFail(
        found.ownedByOrganizationId,
        req.authContext,
      );
    }

    return productDataModelToDto(found);
  }

  @ApiOperation({
    summary: 'Find all product data models',
    description:
      "Find all product data models which either belong to the user's organization or are public.",
  })
  @ApiResponse({
    schema: productDataModelGetAllDocumentation,
  })
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
