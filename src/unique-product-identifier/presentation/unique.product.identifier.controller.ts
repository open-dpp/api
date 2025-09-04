import { Controller, Get, Param, Request } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { ItemsService } from '../../items/infrastructure/items.service';
import { UniqueProductIdentifierService } from '../infrastructure/unique-product-identifier.service';
import {
  UniqueProductIdentifierMetadataDtoSchema,
  UniqueProductIdentifierReferenceDtoSchema,
} from './dto/unique-product-identifier-dto.schema';
import { AuthRequest } from '../../auth/auth-request';
import { PermissionsService } from '../../permissions/permissions.service';

import { AllowServiceAccess } from '../../auth/decorators/allow-service-access.decorator';

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

  @AllowServiceAccess()
  @Get('unique-product-identifiers/:id/metadata')
  async get(@Param('id') id: string) {
    const uniqueProductIdentifier =
      await this.uniqueProductIdentifierService.findOneOrFail(id);
    const item = await this.itemService.findOne(
      uniqueProductIdentifier.referenceId,
    );
    const modelId = item?.modelId ?? uniqueProductIdentifier.referenceId;
    const model = await this.modelsService.findOneOrFail(modelId);

    return UniqueProductIdentifierMetadataDtoSchema.parse({
      organizationId: model.ownedByOrganizationId,
      passportId: item?.id ?? model.id,
      modelId: model.id,
      templateId: model.templateId,
    });
  }
}
