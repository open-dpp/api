import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import * as databaseConfig from './database/config';

import * as path from 'path';
import { TypeOrmTestingModule } from '../test/typeorm.testing.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    jest.spyOn(databaseConfig, 'generateConfig');

    module = await Test.createTestingModule({
      imports: [TypeOrmTestingModule, AppModule],
    })
      .overrideProvider('APP_GUARD')
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ConfigModule configured as global', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should use generateConfig with correct path for TypeOrm configuration', () => {
    expect(databaseConfig.generateConfig).toHaveBeenCalledWith(
      expect.any(Object),
      path.join(__dirname, '/migrations/**/*{.ts,.js}'),
    );
  });
});
