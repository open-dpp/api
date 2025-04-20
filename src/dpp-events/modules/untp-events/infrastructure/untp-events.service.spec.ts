import { Test, TestingModule } from '@nestjs/testing';
import { UntpEventsService } from './untp-events.service';

describe('UntpEventsService', () => {
  let service: UntpEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UntpEventsService],
    }).compile();

    service = module.get<UntpEventsService>(UntpEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
