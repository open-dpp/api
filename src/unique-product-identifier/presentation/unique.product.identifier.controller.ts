import { Controller, Get, Param, Request } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { Public } from '../../auth/public/public.decorator';
import { View } from '../domain/view';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { ItemsService } from '../../items/infrastructure/items.service';
import { UniqueProductIdentifierService } from '../infrastructure/unique-product-identifier.service';
import { UniqueProductIdentifierReferenceDtoSchema } from './dto/unique-product-identifier-dto.schema';
import { AuthRequest } from '../../auth/auth-request';
import { PermissionsService } from '../../permissions/permissions.service';

@Controller()
export class UniqueProductIdentifierController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly uniqueProductIdentifierService: UniqueProductIdentifierService,
    private readonly productDataModelService: ProductDataModelService,
    private readonly itemService: ItemsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Public()
  @Get('unique-product-identifiers/:id/view')
  async buildView(@Param('id') id: string) {
    const uniqueProductIdentifier =
      await this.uniqueProductIdentifierService.findOneOrFail(id);
    const item = await this.itemService.findOne(
      uniqueProductIdentifier.referenceId,
    );
    const modelId = item?.modelId ?? uniqueProductIdentifier.referenceId;
    const model = await this.modelsService.findOneOrFail(modelId);

    const productDataModel = await this.productDataModelService.findOneOrFail(
      model.productDataModelId,
    );
    return View.create({
      model: model,
      productDataModel: productDataModel,
      item,
    }).build();
  }

  @Get('organizations/:orgaId/unique-product-identifiers/:id/reference')
  async getReferencedProductPassport(
    @Param('orgaId') organizationId: string,
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const uniqueProductIdentifier =
      await this.uniqueProductIdentifierService.findOneOrFail(id);

    const item = await this.itemService.findOne(
      uniqueProductIdentifier.referenceId,
    );
    if (item) {
      return UniqueProductIdentifierReferenceDtoSchema.parse({
        id: item.id,
        organizationId: item.ownedByOrganizationId,
        modelId: item.modelId,
        granularityLevel: item.granularityLevel,
      });
    } else {
      const model = await this.modelsService.findOneOrFail(
        uniqueProductIdentifier.referenceId,
      );
      return UniqueProductIdentifierReferenceDtoSchema.parse({
        id: model.id,
        organizationId: model.ownedByOrganizationId,
        granularityLevel: model.granularityLevel,
      });
    }
  }
}
