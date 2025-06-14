import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
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
  CreateAasConnectionSchema,
} from './dto/create-aas-connection.dto';
import { AasConnection } from '../domain/aas-connection';
import {
  UpdateAasConnectionDto,
  UpdateAasConnectionSchema,
} from './dto/update-aas-connection.dto';

@Controller('organizations/:orgaId/integration/aas')
export class AasConnectionController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly itemService: ItemsService,
    private aasConnectionService: AasConnectionService,
    private productDataModelService: ProductDataModelService,
    private configService: ConfigService,
    private permissionsService: PermissionsService,
  ) {}

  @Public()
  @Post('/connections/:connectionId/items/')
  async create(
    @Headers('API_TOKEN') apiToken: string,
    @Param('orgaId') organizationId: string,
    @Param('connectionId') connectionId: string,
    @Body() aasJson: any,
  ) {
    if (apiToken !== this.configService.get('API_TOKEN')) {
      throw new ForbiddenException('Wrong api token');
    }
    const aasMapping = await this.aasConnectionService.findById(connectionId);

    if (!aasMapping.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }

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

  @Post('/connections')
  async createConnection(
    @Param('orgaId') organizationId: string,
    @Body() body: CreateAasConnectionDto,
    @Request() req: AuthRequest,
  ) {
    const createAasMapping = CreateAasConnectionSchema.parse(body);
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
      name: createAasMapping.name,
      organizationId,
      userId: req.authContext.user.id,
      dataModelId: productDataModel.id,
      aasType: createAasMapping.aasType,
      modelId: model.id,
    });
    for (const fieldMapping of createAasMapping.fieldAssignments) {
      aasConnection.addFieldAssignment(fieldMapping);
    }
    await this.aasConnectionService.save(aasConnection);
    return aasConnectionToDto(aasConnection);
  }

  @Patch('/connections/:connectionId')
  async updateConnection(
    @Param('orgaId') organizationId: string,
    @Param('connectionId') connectionId: string,
    @Body() body: UpdateAasConnectionDto,
    @Request() req: AuthRequest,
  ) {
    const updateAasConnection = UpdateAasConnectionSchema.parse(body);
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const model = await this.modelsService.findOneOrFail(
      updateAasConnection.modelId,
    );
    if (!model.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
    const aasConnection =
      await this.aasConnectionService.findById(connectionId);
    if (!aasConnection.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
    aasConnection.rename(updateAasConnection.name);
    aasConnection.assignModel(model);
    aasConnection.replaceFieldAssignments(updateAasConnection.fieldAssignments);
    await this.aasConnectionService.save(aasConnection);
    return aasConnectionToDto(aasConnection);
  }

  @Get('/connections/:connectionId')
  async findMapping(
    @Param('orgaId') organizationId: string,
    @Param('connectionId') connectionId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const aasMapping = await this.aasConnectionService.findById(connectionId);
    if (!aasMapping.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
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
