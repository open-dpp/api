import { ForbiddenException, Injectable } from '@nestjs/common';
import { Item } from '../domain/item';
import { ItemCreatedEventData } from '../../traceability-events/modules/open-dpp/domain/open-dpp-events/item-created-event.data';
import { UniqueProductIdentifierCreatedEventData } from '../../traceability-events/modules/open-dpp/domain/open-dpp-events/unique-product-identifier-created-event.data';
import { ItemsService } from '../infrastructure/items.service';
import { ModelsService } from '../../models/infrastructure/models.service';
import { TemplateService } from '../../templates/infrastructure/template.service';
import { TraceabilityEventsService } from '../../traceability-events/infrastructure/traceability-events.service';

@Injectable()
export class ItemsApplicationService {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly modelsService: ModelsService,
    private readonly productDataModelService: TemplateService,
    private readonly traceabilityEventsService: TraceabilityEventsService,
  ) {}

  async createItem(
    organizationId: string,
    modelId: string,
    userId: string,
    externalUUID?: string,
  ) {
    const model = await this.modelsService.findOneOrFail(modelId);
    if (!model.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }

    const item = Item.create({
      organizationId,
      userId: userId,
    });

    const productDataModel = model.templateId
      ? await this.productDataModelService.findOneOrFail(model.templateId)
      : undefined;
    item.defineModel(model, productDataModel);
    item.createUniqueProductIdentifier(externalUUID);

    await this.traceabilityEventsService.create(
      ItemCreatedEventData.createWithWrapper({
        itemId: item.id,
        userId: userId,
        organizationId: organizationId,
      }),
    );
    for (const uniqueProductIdentifier of item.uniqueProductIdentifiers) {
      await this.traceabilityEventsService.create(
        UniqueProductIdentifierCreatedEventData.createWithWrapper({
          itemId: item.id,
          userId: userId,
          organizationId: organizationId,
          uniqueProductIdentifierId: uniqueProductIdentifier.uuid,
        }),
      );
    }
    return item;
  }
}
