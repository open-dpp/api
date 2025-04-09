import { Test, TestingModule } from '@nestjs/testing';
import { ViewModule } from './view.module';
import { ViewService } from './infrastructure/view.service';
import { ViewController } from './presentation/view.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseTestingModule } from '../../test/mongo.testing.module';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';

// Mock the Keycloak admin client
jest.mock('@keycloak/keycloak-admin-client', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({})),
  };
});

describe('ViewModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmTestingModule,
        MongooseTestingModule,
        ViewModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide ViewService', () => {
    const service = module.get<ViewService>(ViewService);
    expect(service).toBeDefined();
  });

  it('should provide ViewController', () => {
    const controller = module.get<ViewController>(ViewController);
    expect(controller).toBeDefined();
  });
});
