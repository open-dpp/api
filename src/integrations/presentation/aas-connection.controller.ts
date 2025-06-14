import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { AuthRequest } from '../../auth/auth-request';
import { ModelsService } from '../../models/infrastructure/models.service';
import { AasConnectionService } from '../infrastructure/aas-connection.service';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { Public } from '../../auth/public/public.decorator';
import { ConfigService } from '@nestjs/config';
import { Item } from '../../items/domain/item';
import { itemToDto } from '../../items/presentation/dto/item.dto';
import { ItemsService } from '../../items/infrastructure/items.service';
import { aasConnectionToDto } from './dto/aas-connection.dto';
import { PermissionsService } from '../../permissions/permissions.service';
import {
  AssetAdministrationShell,
  AssetAdministrationShellType,
} from '../domain/asset-administration-shell';
import { AssetAdministrationShellFactory } from '../domain/asset-administration-shell-factory';
import {
  CreateAasConnectionDto,
  CreateAasMappingSchema,
} from './dto/create-aas-connection.dto';
import { AasConnection } from '../domain/aas-connection';

@Controller('organizations/:orgaId/integration/aas')
export class AasConnectionController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly itemService: ItemsService,
    private aasMappingService: AasConnectionService,
    private productDataModelService: ProductDataModelService,
    private configService: ConfigService,
    private permissionsService: PermissionsService,
  ) {}

  @Public()
  @Post('/mappings/:mappingId/items/')
  async create(
    @Headers('API_TOKEN') apiToken: string,
    @Param('orgaId') organizationId: string,
    @Param('mappingId') mappingId: string,
    @Body() aasJson: any,
    @Request() req: AuthRequest,
  ) {
    if (apiToken !== this.configService.get('API_TOKEN')) {
      throw new ForbiddenException('Wrong api token');
    }
    const aasMapping = await this.aasMappingService.findById(mappingId);
    const model = await this.modelsService.findOneOrFail(aasMapping.modelId);
    if (!model.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }

    const item = Item.create({
      organizationId,
      userId: model.createdByUserId,
    });

    const productDataModel = model.productDataModelId
      ? await this.productDataModelService.findOneOrFail(
          model.productDataModelId,
        )
      : undefined;
    item.defineModel(model, productDataModel);
    item.createUniqueProductIdentifier();
    const dataValues = aasMapping.generateDataValues(
      AssetAdministrationShell.create({ content: aasJson }),
    );
    item.modifyDataValues(dataValues);
    return itemToDto(await this.itemService.save(item));
  }

  @Post('/mappings')
  async createMapping(
    @Param('orgaId') organizationId: string,
    @Body() body: CreateAasConnectionDto,
    @Request() req: AuthRequest,
  ) {
    const createAasMapping = CreateAasMappingSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOneOrFail(
      createAasMapping.modelId,
    );
    const productDataModel = await this.productDataModelService.findOneOrFail(
      createAasMapping.dataModelId,
    );
    const aasConnection = AasConnection.create({
      dataModelId: productDataModel.id,
      aasType: createAasMapping.aasType,
      modelId: model.id,
    });
    for (const fieldMapping of createAasMapping.fieldAssignments) {
      aasConnection.addFieldAssignment(fieldMapping);
    }
    await this.aasMappingService.save(aasConnection);
    return aasConnectionToDto(aasConnection);
  }

  @Get('/mappings/:mappingId')
  async findMapping(
    @Param('orgaId') organizationId: string,
    @Param('mappingId') mappingId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const aasMapping = await this.aasMappingService.findById(mappingId);
    return aasConnectionToDto(aasMapping);
  }

  @Get(':aasType/properties')
  async getPropertiesMapping(
    @Param('orgaId') organizationId: string,
    @Param('aasType') aasType: AssetAdministrationShellType,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const assetAdministrationShell =
      AssetAdministrationShellFactory.createAasForType(aasType);
    return assetAdministrationShell.properties;
  }
}
