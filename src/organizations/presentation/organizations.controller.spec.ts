import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from '../infrastructure/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { OrganizationsService } from '../infrastructure/organizations.service';
import { OrganizationsModule } from '../organizations.module';
import { User } from '../../users/domain/user';
import { AuthContext } from '../../auth/auth-request';
import { randomUUID } from 'crypto';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { NotFoundInDatabaseExceptionFilter } from '../../exceptions/exception.handler';

describe('OrganizationController', () => {
  let app: INestApplication;
  let service: OrganizationsService;
  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@example.com');
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([OrganizationEntity, UserEntity]),
        OrganizationsModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: new KeycloakAuthTestingGuard(
            new Map([['token1', authContext.user]]),
          ),
        },
      ],
    })
      .overrideProvider(KeycloakResourcesService)
      .useValue(
        KeycloakResourcesServiceTesting.fromPlain({
          users: [{ id: authContext.user.id, email: authContext.user.email }],
        }),
      )
      .compile();

    service = moduleRef.get<OrganizationsService>(OrganizationsService);
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new NotFoundInDatabaseExceptionFilter());

    await app.init();
  });

  it(`/CREATE organization`, async () => {
    const body = { name: 'My orga name' };
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    const found = await service.findOne(response.body.id);
    expect(response.body.id).toEqual(found.id);
  });

  afterAll(async () => {
    await app.close();
  });
});
