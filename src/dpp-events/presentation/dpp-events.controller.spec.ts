import { Test, TestingModule } from '@nestjs/testing';
import { DppEventsController } from './dpp-events.controller';
import { DppEventsService } from '../infrastructure/dpp-events.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DppEventDocument,
  DppEventSchema,
} from '../infrastructure/dpp-event.document';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';

describe('DppEventsController', () => {
  let controller: DppEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: DppEventDocument.name,
            schema: DppEventSchema,
          },
        ]),
      ],
      controllers: [DppEventsController],
      providers: [DppEventsService],
    }).compile();

    controller = module.get<DppEventsController>(DppEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
