import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakResourcesService } from './keycloak-resources.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

jest.mock('@keycloak/keycloak-admin-client', () => {
  return {
    __esModule: true, // Ensure Jest understands it's an ES module
    default: jest.fn(() => ({
      auth: jest.fn(),
      users: {
        find: jest.fn(),
      },
      groups: {
        create: jest.fn(),
      },
    })),
  };
});

describe('KeycloakResourcesService', () => {
  let service: KeycloakResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [KeycloakResourcesService],
    }).compile();

    service = module.get<KeycloakResourcesService>(KeycloakResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
