import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { SectionType } from '../../product-data-model/domain/section';
import { ProductDataModelDraft } from '../domain/product-data-model-draft';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ProductDataModelDraftService } from './product-data-model-draft.service';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from './product-data-model-draft.schema';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Organization } from '../../organizations/domain/organization';
import { DataSectionDraft } from '../domain/section-draft';
import { DataFieldDraft } from '../domain/data-field-draft';
import { DataFieldType } from '../../product-data-model/domain/data.field';
import { User } from '../../users/domain/user';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';

describe('ProductDataModelDraftMongoService', () => {
  let service: ProductDataModelDraftService;
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDraftDoc.name,
            schema: ProductDataModelDraftSchema,
          },
        ]),
      ],
      providers: [ProductDataModelDraftService],
    }).compile();
    service = module.get<ProductDataModelDraftService>(
      ProductDataModelDraftService,
    );
    mongoConnection = module.get<Connection>(getConnectionToken());
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

  it('saves draft', async () => {
    const productDataModelDraft = ProductDataModelDraft.fromPlain({
      ...laptopModelPlain,
      ownedByOrganizationId: randomUUID(),
      createdByUserId: randomUUID(),
    });
    const { id } = await service.save(productDataModelDraft);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(productDataModelDraft);
  });

  it('fails if requested product data model draft could not be found', async () => {
    await expect(service.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(ProductDataModelDraft.name),
    );
  });

  it('should delete section on product data model draft', async () => {
    const user = new User(randomUUID(), 'test@example.com');
    const organization = Organization.create({ name: 'My orga', user: user });
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
    const found = await service.findOneOrFail(id);
    expect(found.sections).toEqual([section2]);
  });

  it('should delete data fields of product data model draft', async () => {
    const user = new User(randomUUID(), 'test@example.com');
    const organization = Organization.create({ name: 'My orga', user: user });

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
    const found = await service.findOneOrFail(productDataModelDraft.id);
    expect(found.sections[0].dataFields).toEqual([dataField1]);
  });

  it('should return all product data model drafts by organization', async () => {
    const user = new User(randomUUID(), 'test@example.com');

    const organization = Organization.create({ name: 'My orga', user: user });

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

  afterAll(async () => {
    await mongoConnection.close(); // Close connection after tests
  });
});
