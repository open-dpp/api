import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakResourcesController } from './keycloak-resources.controller';
import { KeycloakResourcesService } from '../infrastructure/keycloak-resources.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

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
