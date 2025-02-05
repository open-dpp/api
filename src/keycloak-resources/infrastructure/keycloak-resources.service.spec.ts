import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakResourcesService } from './keycloak-resources.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

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
