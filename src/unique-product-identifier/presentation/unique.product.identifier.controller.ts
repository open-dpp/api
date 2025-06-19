import { Controller, Get, Param, Request } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { Public } from '../../auth/public/public.decorator';
import { View } from '../domain/view';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { ItemsService } from '../../items/infrastructure/items.service';
import { Model } from '../../models/domain/model';
import { UniqueProductIdentifierService } from '../infrastructure/unique-product-identifier.service';
import { Item } from '../../items/domain/item';
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
      await this.uniqueProductIdentifierService.findOne(id);
    let model: Model;
    let item: Item | undefined = undefined;
    try {
      item = await this.itemService.findById(
        uniqueProductIdentifier.referenceId,
      );
      model = await this.modelsService.findOneOrFail(item.modelId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (NotFoundException) {
      model = await this.modelsService.findOneOrFail(
        uniqueProductIdentifier.referenceId,
      );
    }

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
      await this.uniqueProductIdentifierService.findOne(id);
    try {
      const item = await this.itemService.findById(
        uniqueProductIdentifier.referenceId,
      );
      return UniqueProductIdentifierReferenceDtoSchema.parse({
        id: item.id,
        organizationId: item.ownedByOrganizationId,
        modelId: item.modelId,
        granularityLevel: item.granularityLevel,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (NotFoundException) {
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
