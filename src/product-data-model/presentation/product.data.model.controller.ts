import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ProductDataModelService } from '../infrastructure/product-data-model.service';
import { ProductDataModel } from '../domain/product.data.model';
import { AuthRequest } from '../../auth/auth-request';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { ViewService } from '../../view/infrastructure/view.service';
import { TargetGroup } from '../../view/domain/view';

@Controller('product-data-models')
export class ProductDataModelController {
  constructor(
    private readonly productDataModelService: ProductDataModelService,
    private readonly organizationsService: OrganizationsService,
    private readonly viewService: ViewService,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string, @Request() req: AuthRequest) {
    const found = await this.productDataModelService.findOneOrFail(id);
    await this.hasPermissionsOrFail(found, req);

    const foundView =
      await this.viewService.findOneByDataModelAndTargetGroupOrFail(
        id,
        TargetGroup.ALL,
      );

    return { data: found.toPlain(), view: foundView.toPlain() };
  }

  @Get()
  async getAll(
    @Query('organization') organizationId: string,
    @Request() req: AuthRequest,
  ) {
    const organization =
      await this.organizationsService.findOneOrFail(organizationId);
    if (!organization.isMember(req.authContext.user)) {
      throw new ForbiddenException();
    }
    return await this.productDataModelService.findAllAccessibleByOrganization(
      organization,
    );
  }

  private async hasPermissionsOrFail(
    productDataModel: ProductDataModel,
    req: AuthRequest,
  ) {
    if (!productDataModel.isPublic()) {
      const organization = await this.organizationsService.findOneOrFail(
        productDataModel.ownedByOrganizationId,
      );
      if (
        organization === undefined ||
        !organization.isMember(req.authContext.user)
      ) {
        throw new ForbiddenException();
      }
      if (!productDataModel.isOwnedBy(organization)) {
        throw new ForbiddenException();
      }
    }
  }
}
