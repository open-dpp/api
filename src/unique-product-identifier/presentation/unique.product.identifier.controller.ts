import { Controller, Get, Param, Request } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
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
    private readonly itemService: ItemsService,
    private readonly permissionsService: PermissionsService,
  ) {}
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
