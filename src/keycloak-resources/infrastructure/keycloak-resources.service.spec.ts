import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakResourcesService } from './keycloak-resources.service';

describe('KeycloakResourcesService', () => {
  let service: KeycloakResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakResourcesService],
    }).compile();

    service = module.get<KeycloakResourcesService>(KeycloakResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
