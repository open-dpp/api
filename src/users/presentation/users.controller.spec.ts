import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UserEntity } from '../infrastructure/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../domain/user';
import { randomUUID } from 'crypto';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { NotFoundInDatabaseExceptionFilter } from '../../exceptions/exception.handler';
import { UsersService } from '../infrastructure/users.service';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import * as request from 'supertest';
import { UsersModule } from '../users.module';

describe('UsersController', () => {
  let app: INestApplication;
  let usersService: UsersService;

  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@example.com');
  const userName = 'John Doe';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([UserEntity]),
        UsersModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: keycloakAuthTestingGuard,
        },
      ],
    })
      .overrideProvider(KeycloakResourcesService)
      .useValue(
        KeycloakResourcesServiceTesting.fromPlain({
          users: [
            {
              id: authContext.user.id,
              email: authContext.user.email,
              name: userName,
            },
          ],
        }),
      )
      .compile();

    usersService = moduleRef.get(UsersService);

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new NotFoundInDatabaseExceptionFilter());

    await app.init();
  });

  it(`/GET user profile`, async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/me/profile`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [randomUUID()],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);

    expect(response.body).toEqual({
      name: userName,
      email: authContext.user.email,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
