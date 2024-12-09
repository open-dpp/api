import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakImportService } from './keycloak-import.service';

describe('KeycloakImportService', () => {
  let service: KeycloakImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakImportService],
    }).compile();

    service = module.get<KeycloakImportService>(KeycloakImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
