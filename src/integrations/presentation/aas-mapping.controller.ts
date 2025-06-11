import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { ModelsService } from '../../models/infrastructure/models.service';
import { Model } from '../../models/domain/model';
import { randomUUID } from 'crypto';
import { AasMappingService } from '../infrastructure/aas-mapping.service';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { modelToDto } from '../../models/presentation/dto/model.dto';
import { json } from 'express';

@Controller('organizations/:orgaId/integration/aas')
export class AasMappingController {
  constructor(
    private readonly modelsService: ModelsService,
    private aasMappingService: AasMappingService,
    private productDataModelService: ProductDataModelService,
  ) {}

  @Post(':mappingId')
  async create(
    @Param('orgaId') organizationId: string,
    @Param('mappingId') mappingId: string,
    @Body() aasJson: any,
    @Request() req: AuthRequest,
  ) {
    const aasMapping = await this.aasMappingService.findById(mappingId);
    const model = Model.create({
      name: `Test mapping ${randomUUID()}`,
      userId: req.authContext.user.id,
      organizationId,
    });
    model.createUniqueProductIdentifier();
    const productDataModel = await this.productDataModelService.findOneOrFail(
      aasMapping.dataModelId,
    );
    model.assignProductDataModel(productDataModel);
    const dataValues = aasMapping.generateDataValues(aasJson);
    model.modifyDataValues(dataValues);
    return modelToDto(await this.modelsService.save(model));

    //
    // console.log('here', dataValues);
    // const model = await this.modelsService.findOne(modelId);
    // const mergedModel = model.mergeWithPlain({
    //   dataValues: dataValues.map((d) => d.toPlain()),
    // });
    // return (await this.modelsService.save(mergedModel)).toPlain();
  }
}
