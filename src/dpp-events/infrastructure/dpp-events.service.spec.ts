import { Test, TestingModule } from '@nestjs/testing';
import { DppEventsService } from './dpp-events.service';

describe('DppEventsService', () => {
  let service: DppEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DppEventsService],
    }).compile();

    service = module.get<DppEventsService>(DppEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
