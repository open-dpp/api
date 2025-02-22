import { Controller, Get, Param } from '@nestjs/common';
import { UniqueProductIdentifierService } from '../infrastructure/unique.product.identifier.service';
import { ModelsService } from '../../models/infrastructure/models.service';
import { Public } from '../../auth/public/public.decorator';
import { View } from '../domain/view';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product.data.model.service';

@Controller('unique-product-identifiers')
export class UniqueProductIdentifierController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly uniqueProductIdentifierService: UniqueProductIdentifierService,
    private readonly productDataModelService: ProductDataModelService,
  ) {}

  @Public()
  @Get(':id/view')
  async findOne(@Param('id') id: string) {
    const uniqueProductIdentifier =
      await this.uniqueProductIdentifierService.findOne(id);
    const model = await this.modelsService.findOne(
      uniqueProductIdentifier.referenceId,
    );
    const productDataModel = await this.productDataModelService.findOne(
      model.productDataModelId,
    );
    return View.fromPlain({
      model: model,
      productDataModel: productDataModel,
    }).build();
  }
}
