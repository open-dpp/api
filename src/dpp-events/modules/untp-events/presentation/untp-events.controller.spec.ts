import { Test, TestingModule } from '@nestjs/testing';
import { UntpEventsController } from './untp-events.controller';

describe('UntpEventsController', () => {
  let controller: UntpEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UntpEventsController],
    }).compile();

    controller = module.get<UntpEventsController>(UntpEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
