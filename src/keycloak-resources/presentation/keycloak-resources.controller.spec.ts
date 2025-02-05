import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakResourcesController } from './keycloak-resources.controller';

describe('KeycloakResourcesController', () => {
  let controller: KeycloakResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeycloakResourcesController],
    }).compile();

    controller = module.get<KeycloakResourcesController>(KeycloakResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
