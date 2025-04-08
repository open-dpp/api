import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import { Connection } from 'mongoose';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Breakpoints, NodeType } from '../domain/node';
import { getLayoutSchema, LayoutDoc } from './layout.schema';
import { LayoutService } from './layout.service';
import { Layout } from '../domain/layout';

describe('LayoutService', () => {
  let service: LayoutService;
  const user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({ name: 'Firma Y', user });
  let mongoConnection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeatureAsync([
          {
            name: LayoutDoc.name,
            useFactory: () => getLayoutSchema(),
          },
        ]),
      ],
      providers: [LayoutService],
    }).compile();
    service = module.get<LayoutService>(LayoutService);
    mongoConnection = module.get<Connection>(getConnectionToken());
  });

  const smSize = Breakpoints.sm().sizeInPx;
  const layoutPlain = {
    name: 'my layout',
    nodes: [
      {
        type: NodeType.GRID_CONTAINER,
        children: [
          {
            type: NodeType.GRID_ITEM,
            sizes: [
              { breakpoint: { sizeInPx: smSize, name: 'sm' }, colSpan: 4 },
            ],
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
        children: [
          {
            type: NodeType.GRID_ITEM,
            sizes: [
              { breakpoint: { sizeInPx: smSize, name: 'sm' }, colSpan: 12 },
            ],
          },
        ],
      },
    ],
  };

  it('fails if requested layout could not be found', async () => {
    await expect(service.findOneOrFail(randomUUID())).rejects.toThrow(
      new NotFoundInDatabaseException(Layout.name),
    );
  });

  it('should save layout', async () => {
    const layout = Layout.fromPlain({
      ...layoutPlain,
    });

    const { id } = await service.save(layout);
    const found = await service.findOneOrFail(id);
    expect(found).toEqual(layout);
  });

  afterAll(async () => {
    await mongoConnection.close();
  });
});
