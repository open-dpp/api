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

describe('OrganizationController', () => {
  let app: INestApplication;
  let service: OrganizationsService;

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
            new Map([['token1', new User('user1', 'test@test.test')]]),
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
