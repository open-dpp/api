import { Test, TestingModule } from '@nestjs/testing';
import { PermalinksService } from './permalinks.service';

describe('PermalinksService', () => {
  let service: PermalinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermalinksService],
    }).compile();

    service = module.get<PermalinksService>(PermalinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
