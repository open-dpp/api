import { Test, TestingModule } from '@nestjs/testing';
import { DppEventsController } from './dpp-events.controller';

describe('DppEventsController', () => {
  let controller: DppEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DppEventsController],
    }).compile();

    controller = module.get<DppEventsController>(DppEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
