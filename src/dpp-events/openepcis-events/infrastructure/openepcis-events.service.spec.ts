import { Test, TestingModule } from '@nestjs/testing';
import { OpenepcisEventsService } from './openepcis-events.service';

describe('OpenepcisEventsService', () => {
  let service: OpenepcisEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenepcisEventsService],
    }).compile();

    service = module.get<OpenepcisEventsService>(OpenepcisEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
