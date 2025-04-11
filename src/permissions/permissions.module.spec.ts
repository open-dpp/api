import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsModule } from './permissions.module';

describe('PermissionsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PermissionsModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
