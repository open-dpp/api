import { Test, TestingModule } from '@nestjs/testing';
import { ModelsService } from './models.service';
import { DataValue, Model } from '../domain/model';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { Organization } from '../../organizations/domain/organization';
import { SectionType } from '../../data-modelling/domain/section-base';
import { Connection } from 'mongoose';
import { ModelDoc, ModelSchema } from './model.schema';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { UniqueProductIdentifierService } from '../../unique-product-identifier/infrastructure/unique-product-identifier.service';
import {
  UniqueProductIdentifierDoc,
  UniqueProductIdentifierSchema,
} from '../../unique-product-identifier/infrastructure/unique-product-identifier.schema';

describe('ModelsService', () => {
  let modelsService: ModelsService;
  const user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({ name: 'Firma Y', user });
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: UniqueProductIdentifierDoc.name,
            schema: UniqueProductIdentifierSchema,
          },
          {
            name: ModelDoc.name,
            schema: ModelSchema,
          },
        ]),
      ],
      providers: [ModelsService, UniqueProductIdentifierService],
    }).compile();
    modelsService = module.get<ModelsService>(ModelsService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  it('should create a model', async () => {
    const model = Model.create({ name: 'My product', user, organization });
    const productDataModel = ProductDataModel.fromPlain({
      name: 'Laptop',
      version: '1.0',
      sections: [
        {
          name: 'Section 1',
          type: SectionType.GROUP,
          layout: {
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          dataFields: [
            {
              type: 'TextField',
              name: 'Title',
              options: { min: 2 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
            {
              type: 'TextField',
              name: 'Title 2',
              options: { min: 7 },
              layout: {
                colStart: { sm: 2 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
          ],
        },
        {
          name: 'Section 2',
          type: SectionType.GROUP,
          layout: {
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          dataFields: [
            {
              type: 'TextField',
              name: 'Title 3',
              options: { min: 8 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
            },
          ],
        },
        {
          name: 'Section 3',
          type: SectionType.REPEATABLE,
          layout: {
            cols: { sm: 3 },
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          dataFields: [
            {
              type: 'TextField',
              name: 'Title 4',
              options: { min: 8 },
              layout: {
                colStart: { sm: 1 },
                colSpan: { sm: 1 },
                rowStart: { sm: 1 },
                rowSpan: { sm: 1 },
              },
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
    const otherOrganization = Organization.create({
      name: 'My orga',
      user: user,
    });
    const model1 = Model.create({
      name: 'Product A',
      user,
      organization: otherOrganization,
    });
    const model2 = Model.create({
      name: 'Product B',
      user,
      organization: otherOrganization,
    });
    const model3 = Model.create({
      name: 'Product C',
      user,
      organization: otherOrganization,
    });
    await modelsService.save(model1);
    await modelsService.save(model2);
    await modelsService.save(model3);

    const foundModels = await modelsService.findAllByOrganization(
      otherOrganization.id,
    );
    expect(foundModels.map((m) => m.toPlain())).toEqual(
      [model1, model2, model3].map((m) => m.toPlain()),
    );
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
