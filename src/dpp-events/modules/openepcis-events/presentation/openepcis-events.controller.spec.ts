import { Test, TestingModule } from '@nestjs/testing';
import { OpenepcisEventsController } from './openepcis-events.controller';

describe('OpenepcisEventsController', () => {
  let controller: OpenepcisEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenepcisEventsController],
    }).compile();

    controller = module.get<OpenepcisEventsController>(
      OpenepcisEventsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
