import { Test, TestingModule } from '@nestjs/testing';
import { PermalinksController } from './permalinks.controller';
import { PermalinksService } from './permalinks.service';

describe('PermalinksController', () => {
  let controller: PermalinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermalinksController],
      providers: [PermalinksService],
    }).compile();

    controller = module.get<PermalinksController>(PermalinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
