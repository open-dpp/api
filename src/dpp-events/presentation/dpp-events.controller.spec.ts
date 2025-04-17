import { Test, TestingModule } from '@nestjs/testing';
import { DppEventsController } from './dpp-events.controller';
import { DppEventsService } from '../infrastructure/dpp-events.service';

describe('DppEventsController', () => {
  let controller: DppEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DppEventsController],
      providers: [DppEventsService],
    }).compile();

    controller = module.get<DppEventsController>(DppEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
