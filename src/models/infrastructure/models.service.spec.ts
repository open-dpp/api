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
import {
  ProductDataModel,
  SectionType,
} from '../../product-data-model/domain/product.data.model';

describe('ModelsService', () => {
  let modelsService: ModelsService;
  let userService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([
          ModelEntity,
          UniqueProductIdentifierEntity,
          UserEntity,
        ]),
      ],
      providers: [ModelsService, UniqueProductIdentifierService, UsersService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    modelsService = module.get<ModelsService>(ModelsService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should create a product', async () => {
    const user = new User(randomUUID(), 'test@test.test');
    await userService.save(user);
    const model = Model.fromPlain({
      name: 'My product',
      description: 'This is my product',
    });
    model.assignOwner(user);
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
    const foundProduct = await modelsService.findOne(id);
    expect(foundProduct.name).toEqual(model.name);
    expect(foundProduct.description).toEqual(model.description);
    expect(foundProduct.productDataModelId).toEqual(productDataModel.id);
    expect(foundProduct.dataValues).toEqual([
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

    expect((await userService.findOne(user.id)).id).toEqual(foundProduct.owner);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
});
