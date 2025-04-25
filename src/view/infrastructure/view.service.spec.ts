import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { NodeType } from '../domain/node';
import { getViewSchema, ViewDoc } from './view.schema';
import { ViewService } from './view.service';
import { TargetGroup, View } from '../domain/view';

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

  const dataModelId = randomUUID();
  const colStartAndSpan = { colStart: { md: 2 }, colSpan: { md: 3 } };

  const viewPlain = {
    id: randomUUID(),
    version: '1.0.0',
    dataModelId: dataModelId,
    targetGroup: TargetGroup.ALL,
    nodes: [
      {
        id: 's1',
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId1',
        cols: { sm: 1 },
        ...colStartAndSpan,
        children: ['df11'],
      },
      {
        id: 'df11',
        type: NodeType.DATA_FIELD_REF,
        ...colStartAndSpan,
        fieldId: 'f11',
        parentId: 's1',
        children: [],
      },
      {
        id: 's2',
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId2',
        ...colStartAndSpan,
        cols: { lg: 2 },
        children: ['s21', 'df22'],
      },
      {
        id: 's21',
        type: NodeType.SECTION_GRID,
        sectionId: 'sectionId21',
        ...colStartAndSpan,
        cols: { xs: 2 },
        parentId: 's2',
        children: ['df211'],
      },
      {
        id: 'df211',
        type: NodeType.DATA_FIELD_REF,
        fieldId: 'f211',
        ...colStartAndSpan,
        parentId: 's21',
        children: [],
      },
      {
        id: 'df22',
        type: NodeType.DATA_FIELD_REF,
        fieldId: 'f22',
        ...colStartAndSpan,
        parentId: 's2',
        children: [],
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
      service.findOneByDataModelAndTargetGroupOrFail(
        randomUUID(),
        TargetGroup.ALL,
      ),
    ).rejects.toThrow(new NotFoundInDatabaseException(View.name));
  });

  it('find by view by data model and target group', async () => {
    const dataModelId = randomUUID();
    const view = View.fromPlain({
      ...viewPlain,
      dataModelId,
    });

    await service.save(view);
    const found = await service.findOneByDataModelAndTargetGroupOrFail(
      dataModelId,
      TargetGroup.ALL,
    );
    expect(found).toEqual(view);
  });

  it('should save view', async () => {
    const view = View.fromPlain({
      ...viewPlain,
    });

    const { id } = await service.save(view);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(view);
  });

  it('should check unique key (targetGroup,dataModelId)', async () => {
    const plain = { targetGroup: TargetGroup.ALL, dataModelId: randomUUID() };
    const view1 = View.create(plain);
    const view2 = View.create({ ...plain, dataModelId: randomUUID() });
    const view3 = View.create(plain);
    await service.save(view1);
    await service.save(view2);
    await expect(service.save(view3)).rejects.toThrow(Error);
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
