import { INestApplication } from '@nestjs/common';
import { ModelsService } from '../../models/infrastructure/models.service';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Test } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import * as request from 'supertest';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { UsersService } from '../../users/infrastructure/users.service';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';
import { PermissionsModule } from '../../permissions/permissions.module';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { SectionType } from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { IntegrationModule } from '../integration.module';
import { AasMappingService } from '../infrastructure/aas-mapping.service';
import { AasFieldMapping, AasMapping } from '../domain/aas-mapping';
import { aasTruckExample } from '../domain/truck-example';
import { json } from 'express';

describe('AasMappingController', () => {
  let app: INestApplication;
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());
  let modelsService: ModelsService;
  let productDataModelService: ProductDataModelService;
  let aasMappingService: AasMappingService;

  const authContext = new AuthContext();
  authContext.user = new User(randomUUID(), 'test@test.test');
  const organizationId = randomUUID();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([UserEntity, OrganizationEntity]),
        MongooseTestingModule,
        IntegrationModule,
        PermissionsModule,
      ],
      providers: [
        OrganizationsService,
        UsersService,
        {
          provide: APP_GUARD,
          useValue: keycloakAuthTestingGuard,
        },
        {
          provide: KeycloakResourcesService,
          useValue: KeycloakResourcesServiceTesting.fromPlain({
            users: [{ id: authContext.user.id, email: authContext.user.email }],
          }),
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

    app = moduleRef.createNestApplication();

    app.use(
      '/organizations/:organizationId/integration/aas/:aasMappingId',
      json({ limit: '50mb' }),
    );

    modelsService = moduleRef.get(ModelsService);
    productDataModelService = moduleRef.get(ProductDataModelService);
    aasMappingService = moduleRef.get(AasMappingService);

    await app.init();
  });

  const sectionId1 = randomUUID();
  const dataFieldId1 = randomUUID();

  const laptopModel = {
    name: 'Laptop',
    version: '1.0',
    ownedByOrganizationId: organizationId,
    createdByUserId: authContext.user.id,
    sections: [
      {
        id: sectionId1,
        name: 'Carbon Footprint',
        type: SectionType.GROUP,
        layout: {
          cols: { sm: 2 },
          colStart: { sm: 1 },
          colSpan: { sm: 2 },
          rowStart: { sm: 1 },
          rowSpan: { sm: 1 },
        },
        dataFields: [
          {
            id: dataFieldId1,
            type: 'TextField',
            name: 'PCFCalculationMethod',
            options: { min: 2 },
            layout: {
              colStart: { sm: 1 },
              colSpan: { sm: 2 },
              rowStart: { sm: 1 },
              rowSpan: { sm: 1 },
            },
            granularityLevel: GranularityLevel.MODEL,
          },
        ],
      },
    ],
  };

  it(`/CREATE model via mapping`, async () => {
    const productDataModel = ProductDataModel.fromPlain(laptopModel);
    await productDataModelService.save(productDataModel);

    const aasMapping = AasMapping.create({ dataModelId: productDataModel.id });
    const fieldMapping = AasFieldMapping.create({
      sectionId: sectionId1,
      dataFieldId: dataFieldId1,
      idShortParent: 'ProductCarbonFootprint_A1A3',
      idShort: 'PCFCO2eq',
    });
    aasMapping.addFieldMapping(fieldMapping);
    await aasMappingService.save(aasMapping);
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/integration/aas/${aasMapping.id}`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          authContext.user.id,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(aasTruckExample);
    expect(response.status).toEqual(201);
    expect(response.body.dataValues).toEqual([
      {
        dataSectionId: sectionId1,
        dataFieldId: dataFieldId1,
        value: 2.63,
        row: 0,
      },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });
});
