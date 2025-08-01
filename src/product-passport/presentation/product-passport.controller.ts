import { Controller, Get, Param } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';
import { TemplateService } from '../../templates/infrastructure/template.service';
import { ItemsService } from '../../items/infrastructure/items.service';
import { Public } from '../../auth/public/public.decorator';
import { ProductPassport } from '../domain/product-passport';

@Controller()
export class ProductPassportController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly uniqueProductIdentifierService: UniqueProductIdentifierService,
    private readonly templateService: TemplateService,
    private readonly itemService: ItemsService,
  ) {}

  @Public()
  @Get('product-passport/:id')
  async buildView(@Param('id') id: string) {
    const uniqueProductIdentifier =
      await this.uniqueProductIdentifierService.findOneOrFail(id);
    const item = await this.itemService.findOne(
      uniqueProductIdentifier.referenceId,
    );
    const modelId = item?.modelId ?? uniqueProductIdentifier.referenceId;
    const model = await this.modelsService.findOneOrFail(modelId);

    const template = await this.templateService.findOneOrFail(model.templateId);

    const productPassport = ProductPassport.create({
      uniqueProductIdentifier,
      template,
      model,
      item,
    });

    return productPassport.mergeTemplateWithData();
  }
}
