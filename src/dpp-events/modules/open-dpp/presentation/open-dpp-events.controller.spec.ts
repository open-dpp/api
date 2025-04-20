import { Test, TestingModule } from '@nestjs/testing';
import { OpenDppEventsController } from './open-dpp-events.controller';
import { OpenDppEventsService } from '../infrastructure/open-dpp-events.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OpenDppEventDocument,
  OpenDppEventSchema,
} from '../infrastructure/open-dpp-event.document';
import { MongooseTestingModule } from '../../../../../test/mongo.testing.module';

describe('OpenDppEventsController', () => {
  let controller: OpenDppEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: OpenDppEventDocument.name,
            schema: OpenDppEventSchema,
          },
        ]),
      ],
      controllers: [OpenDppEventsController],
      providers: [OpenDppEventsService],
    }).compile();

    controller = module.get<OpenDppEventsController>(OpenDppEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
