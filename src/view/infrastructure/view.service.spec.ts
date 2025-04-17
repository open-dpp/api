import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Breakpoints, NodeType } from '../domain/node';
import { getViewSchema, ViewDoc } from './view.schema';
import { ViewService } from './view.service';
import { View } from '../domain/view';

describe('ViewService', () => {
  let service: ViewService;
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeatureAsync([
          {
            name: ViewDoc.name,
            useFactory: () => getViewSchema(),
          },
        ]),
      ],
      providers: [ViewService],
    }).compile();
    service = module.get<ViewService>(ViewService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  const viewPlain = {
    name: 'my view',
    version: '1.0.0',
    ownedByOrganizationId: randomUUID(),
    createdByUserId: randomUUID(),
    dataModelId: randomUUID(),
    nodes: [
      {
        type: NodeType.GRID_CONTAINER,
        cols: 2,
        children: [
          {
            type: NodeType.GRID_ITEM,
            sizes: [{ breakpoint: Breakpoints.sm, colSpan: 4 }],
            content: {
              type: NodeType.DATA_FIELD_REF,
              fieldId: 'f1',
            },
          },
        ],
      },
      {
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId',
        cols: 4,
        children: [
          {
            type: NodeType.GRID_ITEM,
            sizes: [{ breakpoint: Breakpoints.sm, colSpan: 12 }],
          },
        ],
      },
    ],
  };

  it('fails if requested view could not be found', async () => {
    await expect(service.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(View.name),
    );
  });

  it('fails if requested view could not be found by data model id', async () => {
    await expect(
      service.findOneByDataModelIdOrFail(randomUUID()),
    ).rejects.toThrow(new NotFoundInDatabaseException(View.name));
  });

  it('find by data Model Id if requested layout could not be found', async () => {
    const dataModelId = randomUUID();
    const view = View.fromPlain({
      ...viewPlain,
      dataModelId,
    });

    await service.save(view);
    const found = await service.findOneByDataModelIdOrFail(dataModelId);
    expect(found).toEqual(view);
  });

  it('should save layout', async () => {
    const view = View.fromPlain({
      ...viewPlain,
    });

    const { id } = await service.save(view);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(view);
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
