import { PermissionsGuard } from './permissions.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';

describe('PermissionsGuard', () => {
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
    }).compile();

    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(new PermissionsGuard(reflector)).toBeDefined();
  });
});
