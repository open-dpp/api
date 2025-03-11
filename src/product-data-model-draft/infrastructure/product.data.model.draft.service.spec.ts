import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ProductDataModelDraftEntity } from './product.data.model.draft.entity';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { ProductDataModelDraftService } from './product.data.model.draft.service';
import { SectionType } from '../../product-data-model/domain/section';
import { ProductDataModelDraft } from '../domain/product.data.model.draft';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { User } from '../../users/domain/user';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { UsersService } from '../../users/infrastructure/users.service';
import { Organization } from '../../organizations/domain/organization';
import { DataFieldDraft } from '../domain/data.field.draft';
import { DataFieldType } from '../../product-data-model/domain/data.field';
import { DataSectionDraft } from '../domain/section.draft';

describe('ProductDataModelDraftService', () => {
  let service: ProductDataModelDraftService;
  let dataSource: DataSource;
  let organizationService: OrganizationsService;

  const user = new User(randomUUID(), 'test@test.test');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ProductDataModelDraftEntity,
          UserEntity,
          OrganizationEntity,
        ]),
      ],
      providers: [
        ProductDataModelDraftService,
        UsersService,
        OrganizationsService,
        {
          provide: KeycloakResourcesService,
          useValue: KeycloakResourcesServiceTesting.fromPlain({
            users: [{ id: user.id, email: user.email }],
          }),
        },
      ],
    }).compile();
    service = module.get<ProductDataModelDraftService>(
      ProductDataModelDraftService,
    );
    organizationService =
      module.get<OrganizationsService>(OrganizationsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  const laptopModelPlain = {
    name: 'Laptop',
    version: 'v2',
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
    publications: [
      {
        id: randomUUID(),
        version: '1.0.0',
      },
      {
        id: randomUUID(),
        version: '2.0.0',
      },
    ],
  };

  it('fails if requested product data model draft could not be found', async () => {
    await expect(service.findOne(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(ProductDataModelDraft.name),
    );
  });

  it('should create product data model draft', async () => {
    const organization = Organization.create({ name: 'My orga', user: user });
    await organizationService.save(organization);
    const productDataModelDraft = ProductDataModelDraft.fromPlain({
      ...laptopModelPlain,
      ownedByOrganizationId: organization.id,
      createdByUserId: user.id,
    });

    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOne(id);
    expect(found).toEqual(productDataModelDraft);
  });

  it('should delete section on product data model draft', async () => {
    const organization = Organization.create({ name: 'My orga', user: user });
    await organizationService.save(organization);
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user,
    });
    const section1 = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    const section2 = DataSectionDraft.create({
      name: 'Traceability',
      type: SectionType.GROUP,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSection(section2);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    productDataModelDraft.addDataFieldToSection(section1.id, dataField);

    await service.save(productDataModelDraft);
    productDataModelDraft.deleteSection(section1.id);
    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOne(id);
    expect(found.sections).toEqual([section2]);
  });

  it('should delete data fields of product data model draft', async () => {
    const organization = Organization.create({ name: 'My orga', user: user });
    await organizationService.save(organization);
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'draft',
      organization,
      user,
    });
    const section = DataSectionDraft.create({
      name: 'Tech specs',
      type: SectionType.GROUP,
    });
    productDataModelDraft.addSection(section);
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });

    productDataModelDraft.addDataFieldToSection(section.id, dataField1);
    productDataModelDraft.addDataFieldToSection(section.id, dataField2);
    await service.save(productDataModelDraft);
    productDataModelDraft.deleteDataFieldOfSection(section.id, dataField2.id);
    await service.save(productDataModelDraft);
    const found = await service.findOne(productDataModelDraft.id);
    expect(found.sections[0].dataFields).toEqual([dataField1]);
  });

  it('should return all product data model drafts by organization', async () => {
    const organization = Organization.create({ name: 'My orga', user: user });
    await organizationService.save(organization);
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user,
    });
    const phoneDraft = ProductDataModelDraft.create({
      name: 'phone',
      organization,
      user,
    });
    await service.save(laptopDraft);
    await service.save(phoneDraft);
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: user,
    });
    await organizationService.save(otherOrganization);
    await service.save(
      ProductDataModelDraft.create({
        name: 'other draft',
        organization: otherOrganization,
        user,
      }),
    );
    const foundAll = await service.findAllByOrganization(organization.id);
    expect(foundAll).toEqual([
      { id: laptopDraft.id, name: laptopDraft.name },
      { id: phoneDraft.id, name: phoneDraft.name },
    ]);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
