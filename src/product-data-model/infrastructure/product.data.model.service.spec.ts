import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductDataModelService } from './product.data.model.service';
import { ProductDataModelEntity } from './product.data.model.entity';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../domain/product.data.model';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { SectionType } from '../domain/section';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { UsersService } from '../../users/infrastructure/users.service';

describe('ProductDataModelService', () => {
  let service: ProductDataModelService;
  let dataSource: DataSource;
  const user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({ name: 'Firma Y', user });
  let organizationService: OrganizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ProductDataModelEntity,
          OrganizationEntity,
          UserEntity,
        ]),
      ],
      providers: [
        ProductDataModelService,
        OrganizationsService,
        UsersService,
        {
          provide: KeycloakResourcesService,
          useValue: KeycloakResourcesServiceTesting.fromPlain({
            users: [{ id: user.id, email: user.email }],
          }),
        },
      ],
    }).compile();
    service = module.get<ProductDataModelService>(ProductDataModelService);
    organizationService =
      module.get<OrganizationsService>(OrganizationsService);
    await organizationService.save(organization);
    dataSource = module.get<DataSource>(DataSource);
  });

  const laptopModelPlain = {
    name: 'Laptop',
    version: 'v2',
    visibility: VisibilityLevel.PUBLIC,
    ownedByOrganizationId: organization.id,
    createdByUserId: user.id,
    sections: [
      {
        name: 'Environment',
        type: SectionType.GROUP,
        dataFields: [
          {
            name: 'Serial number',
            type: 'TextField',
          },
          {
            name: 'Processor',
            type: 'TextField',
          },
        ],
      },
    ],
  };

  it('fails if requested product data model could not be found', async () => {
    await expect(service.findOne(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(ProductDataModel.name),
    );
  });

  it('should create product data model', async () => {
    const productDataModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
    });

    const { id } = await service.save(productDataModel);
    const found = await service.findOne(id);
    expect(found).toEqual(productDataModel);
  });

  it('should return product data models by name', async () => {
    const productDataModel = ProductDataModel.fromPlain({
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

  it('should return all product data models belonging to organization and which are public', async () => {
    const laptopModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
      visibility: VisibilityLevel.PRIVATE,
    });
    const phoneModel = ProductDataModel.fromPlain({
      ...laptopModelPlain,
      name: 'phone',
      visibility: VisibilityLevel.PRIVATE,
    });
    const otherUser = new User(randomUUID(), 'test@example.com');
    const otherOrganization = Organization.create({
      name: 'Firma Y',
      user: otherUser,
    });
    await organizationService.save(otherOrganization);
    const publicModel = ProductDataModel.create({
      name: 'publicModel',
      user: otherUser,
      organization: otherOrganization,
      visibility: VisibilityLevel.PUBLIC,
    });

    const privateModel = ProductDataModel.create({
      name: 'privateModel',
      user: otherUser,
      organization: otherOrganization,
      visibility: VisibilityLevel.PRIVATE,
    });
    await service.save(laptopModel);
    await service.save(phoneModel);
    await service.save(publicModel);
    await service.save(privateModel);

    const foundAll =
      await service.findAllAccessibleByOrganization(organization);

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
    expect(foundAll).toContainEqual({
      id: publicModel.id,
      name: publicModel.name,
      version: publicModel.version,
    });
    expect(foundAll).not.toContainEqual({
      id: privateModel.id,
      name: privateModel.name,
      version: privateModel.version,
    });
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
