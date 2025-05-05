import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Connection } from 'mongoose';
import { ProductDataModelDraftService } from './infrastructure/product-data-model-draft.service';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from './infrastructure/product-data-model-draft.schema';
import { MongooseTestingModule } from '../../test/mongo.testing.module';
import {
  ProductDataModelDoc,
  ProductDataModelDocSchemaVersion,
  ProductDataModelSchema,
} from '../product-data-model/infrastructure/product-data-model.schema';
import { MigrationV100ToV101Service } from './migration-v-1-0-0-to-v-1-0-1.service';
import { ProductDataModelService } from '../product-data-model/infrastructure/product-data-model.service';

// TODO: Delete after running import service
describe('ProductDataModelDraftMongoService', () => {
  let mongoConnection: Connection;
  let productDataModelDraftDoc: mongoose.Model<ProductDataModelDraftDoc>;
  let productDataModelDoc: mongoose.Model<ProductDataModelDoc>;
  let productModelDraftService: ProductDataModelDraftService;
  let productDataModelService: ProductDataModelService;
  let migrationService: MigrationV100ToV101Service;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDraftDoc.name,
            schema: ProductDataModelDraftSchema,
          },
          {
            name: ProductDataModelDoc.name,
            schema: ProductDataModelSchema,
          },
        ]),
      ],
      providers: [
        ProductDataModelDraftService,
        ProductDataModelService,
        MigrationV100ToV101Service,
      ],
    }).compile();
    mongoConnection = module.get<Connection>(getConnectionToken());
    productModelDraftService = module.get<ProductDataModelDraftService>(
      ProductDataModelDraftService,
    );
    productDataModelService = module.get<ProductDataModelService>(
      ProductDataModelService,
    );

    migrationService = module.get<MigrationV100ToV101Service>(
      MigrationV100ToV101Service,
    );

    productDataModelDraftDoc = module.get(
      getModelToken(ProductDataModelDraftDoc.name),
    );
    productDataModelDoc = module.get(getModelToken(ProductDataModelDoc.name));
  });

  it('loads old draft model schemas without nesting', async () => {
    const oldSchema = {
      _id: randomUUID(),
      __v: 0,
      _schemaVersion: '1.0.0',
      createdByUserId: randomUUID(),
      name: 'laptop',
      ownedByOrganizationId: randomUUID(),
      publications: [],
      sections: [
        {
          _id: randomUUID(),
          name: 'Tecs',
          type: 'Group',
          dataFields: [
            {
              _id: randomUUID(),
              name: 'Processor',
              type: 'TextField',
            },
            {
              _id: randomUUID(),
              name: 'Memory',
              type: 'TextField',
            },
            {
              _id: randomUUID(),
              name: 'Storage',
              type: 'TextField',
            },
          ],
        },
      ],
      version: '1.0.0',
    };
    const oldDraft = new productDataModelDraftDoc(oldSchema);
    await oldDraft.save({ validateBeforeSave: false });
    await migrationService.migrateDrafts();

    const found = await productModelDraftService.findOneOrFail(oldDraft._id);
    expect(
      (await productDataModelDraftDoc.findById(oldDraft._id))._schemaVersion,
    ).toEqual(ProductDataModelDocSchemaVersion.v1_0_1);
    expect(found.sections[0].toPlain()).toEqual({
      id: expect.any(String),
      name: 'Tecs',
      type: 'Group',
      dataFields: [
        {
          id: expect.any(String),
          name: 'Processor',
          type: 'TextField',
          layout: {
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          options: {},
        },
        {
          id: expect.any(String),
          name: 'Memory',
          type: 'TextField',
          layout: {
            colStart: { sm: 2 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          options: {},
        },
        {
          id: expect.any(String),
          name: 'Storage',
          type: 'TextField',
          layout: {
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          options: {},
        },
      ],
      subSections: [],
      parentId: undefined,
      layout: {
        cols: { sm: 2 },
        colStart: { sm: 1 },
        colSpan: { sm: 1 },
        rowStart: { sm: 1 },
        rowSpan: { sm: 1 },
      },
    });
  });

  it('loads old data model schemas without nesting', async () => {
    const oldSchema = {
      _id: randomUUID(),
      __v: 0,
      _schemaVersion: '1.0.0',
      createdByUserId: randomUUID(),
      name: 'laptop',
      ownedByOrganizationId: randomUUID(),
      publications: [],
      sections: [
        {
          _id: randomUUID(),
          name: 'Tecs',
          type: 'Group',
          dataFields: [
            {
              _id: randomUUID(),
              name: 'Processor',
              type: 'TextField',
            },
            {
              _id: randomUUID(),
              name: 'Memory',
              type: 'TextField',
            },
            {
              _id: randomUUID(),
              name: 'Storage',
              type: 'TextField',
            },
          ],
        },
      ],
      version: '1.0.0',
    };
    const oldDataModel = new productDataModelDoc(oldSchema);
    await oldDataModel.save({ validateBeforeSave: false });
    await migrationService.migrateDataModels();

    const found = await productDataModelService.findOneOrFail(oldDataModel._id);
    expect(
      (await productDataModelDoc.findById(oldDataModel._id))._schemaVersion,
    ).toEqual(ProductDataModelDocSchemaVersion.v1_0_1);
    expect(found.sections[0].toPlain()).toEqual({
      id: expect.any(String),
      name: 'Tecs',
      type: 'Group',
      dataFields: [
        {
          id: expect.any(String),
          name: 'Processor',
          type: 'TextField',
          layout: {
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          options: {},
        },
        {
          id: expect.any(String),
          name: 'Memory',
          type: 'TextField',
          layout: {
            colStart: { sm: 2 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          options: {},
        },
        {
          id: expect.any(String),
          name: 'Storage',
          type: 'TextField',
          layout: {
            colStart: { sm: 1 },
            colSpan: { sm: 1 },
            rowStart: { sm: 1 },
            rowSpan: { sm: 1 },
          },
          options: {},
        },
      ],
      subSections: [],
      parentId: undefined,
      layout: {
        cols: { sm: 2 },
        colStart: { sm: 1 },
        colSpan: { sm: 1 },
        rowStart: { sm: 1 },
        rowSpan: { sm: 1 },
      },
    });
  });

  afterAll(async () => {
    await mongoConnection.close(); // Close connection after tests
  });
});
