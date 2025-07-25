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
import { TemplateService } from '../../templates/infrastructure/template.service';
import { Public } from '../../auth/public/public.decorator';
import { ConfigService } from '@nestjs/config';
import { itemToDto } from '../../items/presentation/dto/item.dto';
import { ItemsService } from '../../items/infrastructure/items.service';
import { aasConnectionToDto } from './dto/aas-connection.dto';
import { PermissionsService } from '../../permissions/permissions.service';
import {
  AssetAdministrationShell,
  AssetAdministrationShellType,
  createAasForType,
} from '../domain/asset-administration-shell';
import {
  CreateAasConnectionDto,
  CreateAasConnectionSchema,
} from './dto/create-aas-connection.dto';
import { AasConnection } from '../domain/aas-connection';
import {
  UpdateAasConnectionDto,
  UpdateAasConnectionSchema,
} from './dto/update-aas-connection.dto';
import { GetAasConnectionCollectionSchema } from './dto/get-aas-connection-collection.dto';
import { ItemsApplicationService } from '../../items/presentation/items-application.service';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';

@Controller('organizations/:orgaId/integration/aas')
export class AasConnectionController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly itemService: ItemsService,
    private readonly organizationService: OrganizationsService,
    private readonly itemsApplicationService: ItemsApplicationService,
    private aasConnectionService: AasConnectionService,
    private templateService: TemplateService,
    private configService: ConfigService,
    private permissionsService: PermissionsService,
    private uniqueProductIdentifierService: UniqueProductIdentifierService,
  ) {}

  @Public()
  @Post('/connections/:connectionId/items/')
  async upsertItem(
    @Headers('API_TOKEN') apiToken: string,
    @Param('orgaId') organizationId: string,
    @Param('connectionId') connectionId: string,
    @Body() aasJson: any,
  ) {
    if (apiToken !== this.configService.get('API_TOKEN')) {
      throw new ForbiddenException('Wrong api token');
    }
    const aasConnection =
      await this.aasConnectionService.findById(connectionId);

    if (!aasConnection.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
    const assetAdministrationShell = AssetAdministrationShell.create({
      content: aasJson,
    });

    const uniqueProductIdentifier =
      await this.uniqueProductIdentifierService.findOne(
        assetAdministrationShell.globalAssetId,
      );

    const organization =
      await this.organizationService.findOneOrFail(organizationId);

    const item = uniqueProductIdentifier
      ? await this.itemService.findOneOrFail(
          uniqueProductIdentifier.referenceId,
        )
      : await this.itemsApplicationService.createItem(
          organizationId,
          aasConnection.modelId,
          organization.createdByUserId,
          assetAdministrationShell.globalAssetId,
        );

    const productDataModel = await this.templateService.findOneOrFail(
      aasConnection.dataModelId,
    );

    const dataValues = aasConnection.generateDataValues(
      assetAdministrationShell,
      productDataModel,
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
    const productDataModel = await this.templateService.findOneOrFail(
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

    const aasConnection =
      await this.aasConnectionService.findById(connectionId);
    if (!aasConnection.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
    aasConnection.rename(updateAasConnection.name);

    if (updateAasConnection.modelId !== null) {
      const model = await this.modelsService.findOneOrFail(
        updateAasConnection.modelId,
      );
      if (!model.isOwnedBy(organizationId)) {
        throw new ForbiddenException();
      }

      aasConnection.assignModel(model);
    }
    aasConnection.replaceFieldAssignments(updateAasConnection.fieldAssignments);
    await this.aasConnectionService.save(aasConnection);
    return aasConnectionToDto(aasConnection);
  }

  @Get('/connections/:connectionId')
  async findConnection(
    @Param('orgaId') organizationId: string,
    @Param('connectionId') connectionId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const aasConnection =
      await this.aasConnectionService.findById(connectionId);
    if (!aasConnection.isOwnedBy(organizationId)) {
      throw new ForbiddenException();
    }
    return aasConnectionToDto(aasConnection);
  }

  @Get('/connections')
  async findAllConnectionsOfOrganization(
    @Param('orgaId') organizationId: string,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const aasConnections =
      await this.aasConnectionService.findAllByOrganization(organizationId);
    return GetAasConnectionCollectionSchema.parse(aasConnections);
  }

  @Get(':aasType/properties')
  async getProperties(
    @Param('orgaId') organizationId: string,
    @Param('aasType') aasType: AssetAdministrationShellType,
    @Request() req: AuthRequest,
  ) {
    await this.permissionsService.canAccessOrganizationOrFail(
      organizationId,
      req.authContext,
    );
    const assetAdministrationShell = createAasForType(aasType);
    return assetAdministrationShell.propertiesWithParent;
  }
}
