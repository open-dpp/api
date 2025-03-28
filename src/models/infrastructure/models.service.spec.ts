import { Test, TestingModule } from '@nestjs/testing';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './model.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UsersService } from '../../users/infrastructure/users.service';
import { DataSource } from 'typeorm';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique.product.identifier.service';
import { UniqueProductIdentifierEntity } from '../../unique-product-identifier/infrastructure/unique.product.identifier.entity';
import { DataValue, Model } from '../domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { PermissionsModule } from '../../permissions/permissions.module';
import { ConfigModule } from '@nestjs/config';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { SectionType } from '../../product-data-model/domain/section';

describe('ModelsService', () => {
  let modelsService: ModelsService;
  let organizationService: OrganizationsService;
  let dataSource: DataSource;
  const user = new User(randomUUID(), 'test@test.test');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ModelEntity,
          UniqueProductIdentifierEntity,
          UserEntity,
          OrganizationEntity,
        ]),
        ConfigModule,
        PermissionsModule,
      ],
      providers: [
        ModelsService,
        UniqueProductIdentifierService,
        UsersService,
        OrganizationsService,
        KeycloakResourcesService,
      ],
    })
      .overrideProvider(KeycloakResourcesService)
      .useClass(KeycloakResourcesServiceTesting)
      .compile();

    dataSource = module.get<DataSource>(DataSource);
    modelsService = module.get<ModelsService>(ModelsService);
    organizationService =
      module.get<OrganizationsService>(OrganizationsService);
  });

  it('should create a model', async () => {
    const organization = Organization.create({ name: 'My orga', user: user });
    await organizationService.save(organization);
    const model = Model.create({
      name: 'My product',
      user,
      organization,
    });
    const productDataModel = ProductDataModel.fromPlain({
      name: 'Laptop',
      version: '1.0',
      sections: [
        {
          name: 'Section 1',
          type: SectionType.GROUP,
          dataFields: [
            {
              type: 'TextField',
              name: 'Title',
              options: { min: 2 },
            },
            {
              type: 'TextField',
              name: 'Title 2',
              options: { min: 7 },
            },
          ],
        },
        {
          name: 'Section 2',
          type: SectionType.GROUP,
          dataFields: [
            {
              type: 'TextField',
              name: 'Title 3',
              options: { min: 8 },
            },
          ],
        },
        {
          name: 'Section 3',
          type: SectionType.REPEATABLE,
          dataFields: [
            {
              type: 'TextField',
              name: 'Title 4',
              options: { min: 8 },
            },
          ],
        },
      ],
    });

    model.assignProductDataModel(productDataModel);
    model.addDataValues([
      DataValue.fromPlain({
        dataSectionId: productDataModel.sections[2].id,
        dataFieldId: productDataModel.sections[2].dataFields[0].id,
        row: 0,
      }),
    ]);
    const { id } = await modelsService.save(model);
    const foundModel = await modelsService.findOne(id);
    expect(foundModel.name).toEqual(model.name);
    expect(foundModel.description).toEqual(model.description);
    expect(foundModel.productDataModelId).toEqual(productDataModel.id);
    expect(foundModel.dataValues).toEqual([
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: productDataModel.sections[0].id,
        dataFieldId: productDataModel.sections[0].dataFields[0].id,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: productDataModel.sections[0].id,
        dataFieldId: productDataModel.sections[0].dataFields[1].id,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: productDataModel.sections[1].id,
        dataFieldId: productDataModel.sections[1].dataFields[0].id,
      }),
      DataValue.fromPlain({
        id: expect.anything(),
        dataSectionId: productDataModel.sections[2].id,
        dataFieldId: productDataModel.sections[2].dataFields[0].id,
        row: 0,
      }),
    ]);
    expect(foundModel.createdByUserId).toEqual(user.id);
    expect(foundModel.isOwnedBy(organization)).toBeTruthy();
  });

  it('fails if requested model could not be found', async () => {
    await expect(modelsService.findOne(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(Model.name),
    );
  });

  it('should find all models of organization', async () => {
    const organization = Organization.create({ name: 'My orga', user: user });
    await organizationService.save(organization);
    const model1 = Model.create({
      name: 'Product A',
      user,
      organization,
    });
    const model2 = Model.create({
      name: 'Product B',
      user,
      organization,
    });
    const model3 = Model.create({
      name: 'Product C',
      user,
      organization,
    });
    await modelsService.save(model1);
    await modelsService.save(model2);
    await modelsService.save(model3);

    const foundModels = await modelsService.findAllByOrganization(
      organization.id,
    );
    expect(foundModels).toEqual([model1, model2, model3]);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
