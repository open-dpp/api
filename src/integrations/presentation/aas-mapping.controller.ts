import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { AasFieldMapping, AasMapping } from '../domain/aas-mapping';
import { ModelsService } from '../../models/infrastructure/models.service';

@Controller('organizations/:orgaId/integration/aas')
export class AasMappingController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  async create(
    @Param('orgaId') organizationId: string,
    @Body() aasJson: any,
    @Request() req: AuthRequest,
  ) {
    const modelId = '4eecd26f-fcc1-48a3-9e11-e180c48c61f5';
    const dataModelId = '13ba4fda-bd2f-41e3-9604-8faf032be946';
    const aasMapping = new AasMapping(dataModelId);
    const dataFieldId = 'abead8c5-6bf7-4133-8510-ac3773aa72dd';
    const sectionId = '4ba1e968-08a8-4ca1-b4eb-24e8216ce35b';
    const fieldMapping = new AasFieldMapping(
      dataFieldId,
      sectionId,
      'ProductCarbonFootprint_A1A3',
      'PCFCO2eq',
    );
    aasMapping.addFieldMapping(fieldMapping);
    const dataValues = aasMapping.generateDataValues(aasJson);
    console.log('here', dataValues);
    const model = await this.modelsService.findOne(modelId);
    const mergedModel = model.mergeWithPlain({
      dataValues: dataValues.map((d) => d.toPlain()),
    });
    return (await this.modelsService.save(mergedModel)).toPlain();
  }
}
