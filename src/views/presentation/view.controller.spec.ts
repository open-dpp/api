import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { ViewModule } from '../view.module';
import * as request from 'supertest';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';

describe('ViewController', () => {
  let app: INestApplication;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());
  const userId = randomUUID();
  const organizationId = randomUUID();
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ViewModule],
      providers: [
        {
          provide: APP_GUARD,
          useValue: keycloakAuthTestingGuard,
        },
      ],
    }).compile();

    app = module.createNestApplication();

    await app.init();
  });

  it(`/GET view for template`, async () => {
    const response = await request(app.getHttpServer())
      .get(`/views?templateId=${randomUUID()}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
  });

  afterAll(async () => {
    await module.close();
    await app.close();
  });
});
