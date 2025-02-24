import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakResourcesController } from './keycloak-resources.controller';
import { KeycloakResourcesService } from '../infrastructure/keycloak-resources.service';
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

describe('KeycloakResourcesController', () => {
  let controller: KeycloakResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [KeycloakResourcesService],
      controllers: [KeycloakResourcesController],
    }).compile();

    controller = module.get<KeycloakResourcesController>(
      KeycloakResourcesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
