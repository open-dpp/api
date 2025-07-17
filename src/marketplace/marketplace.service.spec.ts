import { Test, TestingModule } from '@nestjs/testing';
import {
  ProductDataModel,
  ProductDataModelDbProps,
  VisibilityLevel,
} from '../product-data-model/domain/product.data.model';
import { randomUUID } from 'crypto';
import { ProductDataModelDocSchemaVersion } from '../product-data-model/infrastructure/product-data-model.schema';
import { GranularityLevel } from '../data-modelling/domain/granularity-level';
import { GroupSection } from '../product-data-model/domain/section';
import { Layout } from '../data-modelling/domain/layout';
import { TextField } from '../product-data-model/domain/data-field';
import { PassportTemplateCreateDto } from '../../../open-dpp-api-client/src';
import { OrganizationsService } from '../organizations/infrastructure/organizations.service';
import { Organization } from '../organizations/domain/organization';
import { User } from '../users/domain/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from '../organizations/infrastructure/organization.entity';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { UserEntity } from '../users/infrastructure/user.entity';
import { KeycloakResourcesModule } from '../keycloak-resources/keycloak-resources.module';
import { UsersService } from '../users/infrastructure/users.service';
import { MarketplaceService } from './marketplace.service';
import { DataSource } from 'typeorm';
import { Sector } from '@open-dpp/api-client';
import {
  mockCreatePassportTemplateInMarketplace,
  mockSetActiveOrganizationId,
} from '../../jest.setup';

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  const userId = randomUUID();
  const organizationId = randomUUID();
  let organizationService: OrganizationsService;
  let module: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([OrganizationEntity, UserEntity]),
        KeycloakResourcesModule,
      ],
      providers: [MarketplaceService, OrganizationsService, UsersService],
    }).compile();
    service = module.get<MarketplaceService>(MarketplaceService);
    organizationService =
      module.get<OrganizationsService>(OrganizationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  const laptopModelPlain: ProductDataModelDbProps = {
    id: randomUUID(),
    name: 'Laptop',
    version: 'v2',
    visibility: VisibilityLevel.PUBLIC,
    ownedByOrganizationId: organizationId,
    createdByUserId: userId,
    sections: [
      GroupSection.loadFromDb({
        id: 's1',
        parentId: undefined,
        name: 'Environment',
        granularityLevel: GranularityLevel.MODEL,
        layout: Layout.create({
          cols: { sm: 3 },
          colStart: { sm: 1 },
          colSpan: { sm: 7 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.create({
            name: 'Serial number',
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
          TextField.create({
            name: 'Processor',
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
        subSections: ['s1.1'],
      }),
      GroupSection.loadFromDb({
        id: 's1.1',
        parentId: 's1',
        name: 'CO2',
        granularityLevel: GranularityLevel.MODEL,
        layout: Layout.create({
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 1 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        }),
        dataFields: [
          TextField.create({
            name: 'Consumption',
            layout: Layout.create({
              colStart: { sm: 1 },
              colSpan: { sm: 1 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            }),
            granularityLevel: GranularityLevel.MODEL,
          }),
        ],
        subSections: [],
      }),
    ],
  };

  it('should upload product data model to marketplace', async () => {
    const organization = await organizationService.save(
      Organization.fromPlain({
        id: organizationId,
        name: 'orga name',
        members: [new User(userId, `${userId}@example.com`)],
        createdByUserId: userId,
        ownedByUserId: userId,
      }),
    );
    const productDataModel = ProductDataModel.loadFromDb({
      ...laptopModelPlain,
      name: `${randomUUID()}-data-model`,
    });
    const sectors = [Sector.BATTERY];
    await service.uploadToMarketplace(productDataModel, sectors);
    expect(mockSetActiveOrganizationId).toBeCalledWith(organizationId);
    const expected: PassportTemplateCreateDto = {
      version: productDataModel.version,
      name: productDataModel.name,
      description: `Vorlage ${productDataModel.name}`,
      sectors,
      organizationName: organization.name,
      templateData: {
        _id: productDataModel.id,
        name: productDataModel.name,
        version: productDataModel.version,
        visibility: productDataModel.visibility,
        _schemaVersion: ProductDataModelDocSchemaVersion.v1_0_1,
        sections: productDataModel.sections.map((s) => ({
          _id: s.id,
          name: s.name,
          type: s.type,
          granularityLevel: s.granularityLevel,
          dataFields: s.dataFields.map((d) => ({
            _id: d.id,
            name: d.name,
            type: d.type,
            options: d.options,
            layout: d.layout,
            granularityLevel: d.granularityLevel,
          })),
          layout: s.layout,
          subSections: s.subSections,
          parentId: s.parentId,
        })),
        createdByUserId: productDataModel.createdByUserId,
        ownedByOrganizationId: productDataModel.ownedByOrganizationId,
      },
    };
    expect(mockCreatePassportTemplateInMarketplace).toBeCalledWith(expected);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });
});
