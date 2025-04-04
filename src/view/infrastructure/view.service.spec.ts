import { ProductDataModelDraftService } from '../../product-data-model-draft/infrastructure/product-data-model-draft.service';
import { Connection } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  BlockDoc,
  BlockSchema,
  GridSchema,
  PageDoc,
  PageSchema,
} from './page.schema';
import { BlockType } from '../domain/block';
import { Page } from '../domain/page';
import { ViewService } from './view.service';

describe('ViewService', () => {
  let service: ViewService;
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([{ name: PageDoc.name, schema: PageSchema }]),
        MongooseModule.forFeatureAsync([
          {
            name: BlockDoc.name,
            useFactory: () => {
              const schema = BlockSchema;
              schema.discriminator(BlockType.GRID, GridSchema);
              return schema;
            },
          },
        ]),
      ],
      providers: [ViewService],
    }).compile();
    service = module.get<ViewService>(ViewService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  const pagePlain = {
    name: 'Tech Specs',
    version: '1.0.0',
    blocks: [
      {
        type: BlockType.GRID,
        cols: 2,
        items: [
          {
            type: BlockType.FIELD_REFERENCE,
            fieldId: 'f1',
          },
          {
            type: BlockType.FIELD_REFERENCE,
            fieldId: 'f2',
          },
        ],
      },
    ],
  };

  it('saves view', async () => {
    const page = Page.fromPlain(pagePlain);
    const { _id } = await service.save(page);
    const found = await service.findOneOrFail(_id);
    expect(found).toEqual(page);
  });

  afterAll(async () => {
    await mongoConnection.close(); // Close connection after tests
  });
});
