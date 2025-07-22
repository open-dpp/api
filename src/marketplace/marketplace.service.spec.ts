import { Test, TestingModule } from '@nestjs/testing';
import { Template } from '../templates/domain/template';
import { randomUUID } from 'crypto';
import {
  TemplateDoc,
  TemplateDocSchemaVersion,
  TemplateSchema,
} from '../templates/infrastructure/template.schema';
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
import { passportTemplateDtoFactory } from './fixtures/passport.template.factory';
import { MongooseTestingModule } from '../../test/mongo.testing.module';
import { MongooseModule } from '@nestjs/mongoose';
import { laptopFactory } from '../templates/fixtures/laptop.factory';

export const mockCreatePassportTemplateInMarketplace = jest.fn();
export const mockGetPassportTemplateInMarketplace = jest.fn();
export const mockSetActiveOrganizationId = jest.fn();
export const mockSetApiKey = jest.fn();

jest.mock('@open-dpp/api-client', () => ({
  ...jest.requireActual('@open-dpp/api-client'),
  MarketplaceApiClient: jest.fn().mockImplementation(() => ({
    setActiveOrganizationId: mockSetActiveOrganizationId,
    setApiKey: mockSetApiKey,
    passportTemplates: {
      create: mockCreatePassportTemplateInMarketplace,
      getById: mockGetPassportTemplateInMarketplace,
    },
  })),
}));

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
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: TemplateDoc.name,
            schema: TemplateSchema,
          },
        ]),
        KeycloakResourcesModule,
      ],
      providers: [MarketplaceService, OrganizationsService, UsersService],
    }).compile();
    service = module.get<MarketplaceService>(MarketplaceService);
    organizationService =
      module.get<OrganizationsService>(OrganizationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  const laptopModelPlain = laptopFactory.build({
    organizationId,
    userId,
  });

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
    const productDataModel = Template.loadFromDb({
      ...laptopModelPlain,
      name: `${randomUUID()}-data-model`,
    });
    mockCreatePassportTemplateInMarketplace.mockResolvedValue({
      data: { id: randomUUID() },
    });
    const token = randomUUID();
    await service.upload(productDataModel, token);
    expect(mockSetActiveOrganizationId).toBeCalledWith(organizationId);
    expect(mockSetApiKey).toHaveBeenCalledWith(token);
    const expected: PassportTemplateCreateDto = {
      version: productDataModel.version,
      name: productDataModel.name,
      description: productDataModel.description,
      sectors: productDataModel.sectors,
      organizationName: organization.name,
      templateData: {
        _id: productDataModel.id,
        name: productDataModel.name,
        description: productDataModel.description,
        sectors: productDataModel.sectors,
        version: productDataModel.version,
        _schemaVersion: TemplateDocSchemaVersion.v1_0_1,
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
        marketplaceResourceId: productDataModel.marketplaceResourceId,
      },
    };
    expect(mockCreatePassportTemplateInMarketplace).toBeCalledWith(expected);
  });

  it('should download product data model from marketplace', async () => {
    const passportTemplateDto = passportTemplateDtoFactory.build({});
    mockGetPassportTemplateInMarketplace.mockResolvedValue({
      data: passportTemplateDto,
    });
    const productDataModel = await service.download(passportTemplateDto.id);
    expect(mockGetPassportTemplateInMarketplace).toBeCalledWith(
      passportTemplateDto.id,
    );
    expect(productDataModel).toBeInstanceOf(Template);
    expect(productDataModel.marketplaceResourceId).toEqual(
      passportTemplateDto.id,
    );
    expect(productDataModel.name).toEqual(
      passportTemplateDto.templateData.name,
    );
    expect(productDataModel.version).toEqual(
      passportTemplateDto.templateData.version,
    );
    expect(productDataModel.ownedByOrganizationId).toEqual(
      passportTemplateDto.templateData.ownedByOrganizationId,
    );
    expect(productDataModel.createdByUserId).toEqual(
      passportTemplateDto.templateData.createdByUserId,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });
});
