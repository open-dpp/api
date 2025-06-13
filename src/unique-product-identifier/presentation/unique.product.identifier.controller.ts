import { Controller, Get, Param } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { Public } from '../../auth/public/public.decorator';
import { View } from '../domain/view';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { ItemsService } from '../../items/infrastructure/items.service';
import { Model } from '../../models/domain/model';
import { UniqueProductIdentifierService } from '../infrastructure/unique-product-identifier.service';
import { Item } from '../../items/domain/item';

@Controller('unique-product-identifiers')
export class UniqueProductIdentifierController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly uniqueProductIdentifierService: UniqueProductIdentifierService,
    private readonly productDataModelService: ProductDataModelService,
    private readonly itemService: ItemsService,
  ) {}

  @Public()
  @Get(':id/view')
  async findOne(@Param('id') id: string) {
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
}
