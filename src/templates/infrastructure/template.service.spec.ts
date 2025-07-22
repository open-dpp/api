import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { Template } from '../domain/template';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { TemplateDoc, TemplateSchema } from './template.schema';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { KeycloakResourcesModule } from '../../keycloak-resources/keycloak-resources.module';
import { templateCreatePropsFactory } from '../fixtures/template.factory';
import { laptopFactory } from '../fixtures/laptop.factory';
import { sectionDbPropsFactory } from '../fixtures/section.factory';
import { SectionType } from '../../data-modelling/domain/section-base';

describe('ProductDataModelService', () => {
  let service: TemplateService;
  const userId = randomUUID();
  const organizationId = randomUUID();
  let mongoConnection: Connection;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: TemplateDoc.name,
            schema: TemplateSchema,
          },
        ]),
        KeycloakResourcesModule,
      ],
      providers: [TemplateService],
    }).compile();
    service = module.get<TemplateService>(TemplateService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  const laptopModelPlain = laptopFactory.build({
    organizationId,
    userId,
  });

  it('fails if requested product data model could not be found', async () => {
    await expect(service.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(Template.name),
    );
  });

  it('should create product data model', async () => {
    const productDataModel = Template.loadFromDb({
      ...laptopModelPlain,
    });

    const { id } = await service.save(productDataModel);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(productDataModel);
  });

  it('finds product data model by marketplaceResourceId', async () => {
    const laptop = Template.loadFromDb(laptopModelPlain);
    const marketplaceResourceId = randomUUID();
    laptop.assignMarketplaceResource(marketplaceResourceId);
    await service.save(laptop);

    const otherOrganizationId = randomUUID();
    const laptopOtherOrganization = Template.loadFromDb(
      laptopFactory.build({
        organizationId: otherOrganizationId,
        userId: randomUUID(),
      }),
    );
    laptopOtherOrganization.assignMarketplaceResource(marketplaceResourceId);
    await service.save(laptopOtherOrganization);

    let found = await service.findByMarketplaceResource(
      organizationId,
      marketplaceResourceId,
    );
    expect(found).toEqual(laptop);

    found = await service.findByMarketplaceResource(
      otherOrganizationId,
      marketplaceResourceId,
    );
    expect(found).toEqual(laptopOtherOrganization);
  });

  it('sets correct default granularity level', async () => {
    const laptopModel = laptopFactory.build({
      sections: [
        sectionDbPropsFactory.build({
          name: 'Environment',
          granularityLevel: undefined,
        }),
        sectionDbPropsFactory.build({
          type: SectionType.REPEATABLE,
          name: 'Materials',
          granularityLevel: undefined,
        }),
      ],
    });

    const productDataModel = Template.loadFromDb(laptopModel);
    const { id } = await service.save(productDataModel);
    const found = await service.findOneOrFail(id);
    expect(found.sections[0].granularityLevel).toBeUndefined();
    expect(found.sections[1].granularityLevel).toEqual(GranularityLevel.MODEL);
  });

  it('should return product data models by name', async () => {
    const productDataModel = Template.loadFromDb({
      ...laptopModelPlain,
      name: `${randomUUID()}-data-model`,
    });

    await service.save(productDataModel);
    const found = await service.findByName(productDataModel.name);
    expect(found).toEqual([
      {
        id: productDataModel.id,
        name: productDataModel.name,
        version: productDataModel.version,
      },
    ]);
  });

  it('should return all product data models belonging to organization', async () => {
    const laptopModel = Template.loadFromDb({
      ...laptopModelPlain,
    });
    const phoneModel = Template.loadFromDb({
      ...laptopModelPlain,
      id: randomUUID(),
      name: 'phone',
    });
    const otherOrganizationId = randomUUID();
    const privateModel = Template.create(
      templateCreatePropsFactory.build({
        name: 'privateModel',
        organizationId: otherOrganizationId,
      }),
    );
    await service.save(laptopModel);
    await service.save(phoneModel);
    await service.save(privateModel);

    const foundAll = await service.findAllByOrganization(organizationId);

    expect(foundAll).toContainEqual({
      id: laptopModel.id,
      name: laptopModel.name,
      version: laptopModel.version,
    });
    expect(foundAll).toContainEqual({
      id: phoneModel.id,
      name: phoneModel.name,
      version: phoneModel.version,
    });
    expect(foundAll).not.toContainEqual({
      id: privateModel.id,
      name: privateModel.name,
      version: privateModel.version,
    });
  });

  afterAll(async () => {
    await mongoConnection.close();
    await module.close();
  });
});
