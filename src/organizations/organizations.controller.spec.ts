import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../test/typeorm.testing.module';
import { User } from '../users/entities/user.entity';
import { Organization } from './entities/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../test/keycloak-auth.guard.testing';
import { OrganizationsService } from './organizations.service';
import { OrganizationsModule } from './organizations.module';

describe('OrganizationController', () => {
  let app: INestApplication;
  let service: OrganizationsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([Organization, User]),
        OrganizationsModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useValue: new KeycloakAuthTestingGuard(
            new Map([['token1', 'user1']]),
          ),
        },
      ],
    }).compile();

    service = moduleRef.get<OrganizationsService>(OrganizationsService);
    app = moduleRef.createNestApplication();

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
