import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmTestingModule } from '../../../test/typeorm.testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModelDraftModule } from '../product.data.model.draft.module';
import { Organization } from '../../organizations/domain/organization';
import { UserEntity } from '../../users/infrastructure/user.entity';
import { OrganizationEntity } from '../../organizations/infrastructure/organization.entity';
import { OrganizationsModule } from '../../organizations/organizations.module';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { OrganizationsService } from '../../organizations/infrastructure/organizations.service';
import { ProductDataModelDraft } from '../domain/product.data.model.draft';
import { SectionType } from '../../product-data-model/domain/section';
import { DataSectionDraft } from '../domain/section.draft';
import { DataFieldDraft } from '../domain/data.field.draft';
import { DataFieldType } from '../../product-data-model/domain/data.field';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product.data.model.service';
import { VisibilityLevel } from '../../product-data-model/domain/product.data.model';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from '../infrastructure/product.data.model.draft.schema';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { ProductDataModelDraftService } from '../infrastructure/product.data.model.draft.service';
import { Connection } from 'mongoose';

describe('ProductsDataModelDraftController', () => {
  let app: INestApplication;
  const authContext = new AuthContext();
  let organizationsService: OrganizationsService;
  let productDataModelDraftService: ProductDataModelDraftService;
  let productDataModelService: ProductDataModelService;
  authContext.user = new User(randomUUID(), 'test@test.test');
  let mongoConnection: Connection;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmTestingModule,
        TypeOrmModule.forFeature([UserEntity, OrganizationEntity]),
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDraftDoc.name,
            schema: ProductDataModelDraftSchema,
          },
        ]),
        OrganizationsModule,
        ProductDataModelDraftModule,
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

    app = moduleRef.createNestApplication();
    organizationsService =
      moduleRef.get<OrganizationsService>(OrganizationsService);

    productDataModelService = moduleRef.get<ProductDataModelService>(
      ProductDataModelService,
    );
    productDataModelDraftService = moduleRef.get<ProductDataModelDraftService>(
      ProductDataModelDraftService,
    );
    mongoConnection = moduleRef.get<Connection>(getConnectionToken());

    await app.init();
  });

  async function createOrganization(user: User = authContext.user) {
    const organization = Organization.create({
      name: 'My orga',
      user: user,
    });
    return organizationsService.save(organization);
  }

  async function setupToProveMembership() {
    const otherUser = new User(randomUUID(), 'test@example.com');
    const organization = await createOrganization(otherUser);
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: otherUser,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);
    await productDataModelDraftService.save(laptopDraft);
    return {
      orgaId: organization.id,
      sectionId: section.id,
      dataFieldId: dataField.id,
      draftId: laptopDraft.id,
    };
  }

  async function setupToProveDraftOwnership() {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);
    await productDataModelDraftService.save(laptopDraft);
    const otherOrganization = await createOrganization();
    return {
      otherOrgaId: otherOrganization.id,
      orgaId: organization.id,
      sectionId: section.id,
      dataFieldId: dataField.id,
      draftId: laptopDraft.id,
    };
  }

  const userNotMemberTxt = `fails if user is not member of organization`;
  const draftDoesNotBelongToOrga = `fails if draft does not belong to organization`;

  it(`/CREATE product data model draft`, async () => {
    const body = { name: 'My first draft' };
    const organization = await createOrganization();
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/product-data-model-drafts`)
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(response.body).toEqual(found.toPlain());
  });

  it(`/CREATE product data model draft ${userNotMemberTxt}`, async () => {
    const body = { name: 'My first draft' };
    const otherUser = new User(randomUUID(), 'test@example.com');
    const organization = await createOrganization(otherUser);
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organization.id}/product-data-model-drafts`)
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PATCH product data model draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = { name: 'My final laptop draft' };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ ...laptopDraft.toPlain(), ...body });
  });

  it(`/PATCH product data model draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId } = await setupToProveMembership();
    const response = await request(app.getHttpServer())
      .patch(`/organizations/${orgaId}/product-data-model-drafts/${draftId}`)
      .set('Authorization', 'Bearer token1')
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/PATCH product data model draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId } = await setupToProveDraftOwnership();
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}`,
      )
      .set('Authorization', 'Bearer token1')
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/PUBLISH product data model draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);
    await productDataModelDraftService.save(laptopDraft);
    const body = { visibility: VisibilityLevel.PUBLIC };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}/publish`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    const foundDraft = await productDataModelDraftService.findOne(
      response.body.id,
    );
    expect(foundDraft.publications).toEqual([
      { id: expect.any(String), version: '1.0.0' },
    ]);
    const foundModel = await productDataModelService.findOne(
      foundDraft.publications[0].id,
    );
    expect(foundModel.id).toEqual(foundDraft.publications[0].id);
  });

  it(`/PUBLISH product data model draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId } = await setupToProveMembership();
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${orgaId}/product-data-model-drafts/${draftId}/publish`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/PUBLISH product data model draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId } = await setupToProveDraftOwnership();
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}/publish`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/GET product data model drafts of organization`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const phoneDraft = ProductDataModelDraft.create({
      name: 'phone',
      organization,
      user: authContext.user,
    });
    await productDataModelDraftService.save(laptopDraft);
    await productDataModelDraftService.save(phoneDraft);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organization.id}/product-data-model-drafts`)
      .set('Authorization', 'Bearer token1');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      { id: laptopDraft.id, name: laptopDraft.name },
      { id: phoneDraft.id, name: phoneDraft.name },
    ]);
  });

  it(`/GET product data model drafts of organization ${userNotMemberTxt}`, async () => {
    const { orgaId } = await setupToProveMembership();
    const response = await request(app.getHttpServer())
      .get(`/organizations/${orgaId}/product-data-model-drafts`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/CREATE section draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = { name: 'Technical Specs', type: SectionType.GROUP };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}/sections`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.sections).toEqual([
      { ...body, id: expect.any(String), dataFields: [] },
    ]);
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(response.body).toEqual(found.toPlain());
  });

  it(`/CREATE section draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId } = await setupToProveMembership();
    const body = { name: 'Technical Specs', type: SectionType.GROUP };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${orgaId}/product-data-model-drafts/${draftId}/sections`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/CREATE section draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId } = await setupToProveDraftOwnership();
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}/sections`,
      )
      .set('Authorization', 'Bearer token1')
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/GET section draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    await productDataModelDraftService.save(laptopDraft);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(response.body).toEqual(found.toPlain());
  });

  it(`/GET section draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId } = await setupToProveMembership();
    const response = await request(app.getHttpServer())
      .get(`/organizations/${orgaId}/product-data-model-drafts/${draftId}`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/GET section draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId } = await setupToProveDraftOwnership();
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}`)
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/PATCH section draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    await productDataModelDraftService.save(laptopDraft);
    const body = { name: 'Technical Specs' };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(found.findSectionOrFail(section.id)).toEqual({
      ...section,
      _name: body.name,
    });
  });

  it(`/PATCH section draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId, sectionId } = await setupToProveMembership();
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${orgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/PATCH section draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId, sectionId } =
      await setupToProveDraftOwnership();
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/DELETE section draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    await productDataModelDraftService.save(laptopDraft);
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(found.sections).toEqual([]);
  });

  it(`/DELETE section draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId, sectionId } = await setupToProveMembership();
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${orgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/DELETE section draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId, sectionId } =
      await setupToProveDraftOwnership();
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/CREATE data field draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    await productDataModelDraftService.save(laptopDraft);
    const body = {
      name: 'Processor',
      type: SectionType.GROUP,
      options: { min: 2 },
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}/data-fields`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.sections[0].dataFields).toEqual([
      {
        ...body,
        id: expect.any(String),
        options: { min: 2 },
      },
    ]);
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(response.body).toEqual(found.toPlain());
  });

  it(`/CREATE data field draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId, sectionId } = await setupToProveMembership();
    const body = { name: 'Processor', type: SectionType.GROUP };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${orgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}/data-fields`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/CREATE data field draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId, sectionId } =
      await setupToProveDraftOwnership();

    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}/data-fields`,
      )
      .set('Authorization', 'Bearer token1')
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/PATCH data field draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);

    await productDataModelDraftService.save(laptopDraft);
    const body = { name: 'Memory', options: { max: 8 } };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}/data-fields/${dataField.id}`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(found.sections[0].dataFields).toEqual([
      { ...dataField, _name: body.name, options: body.options },
    ]);
  });

  it(`/PATCH data field draft ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId } = await setupToProveMembership();
    const body = { name: 'Memory', options: { max: 8 } };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${orgaId}/product-data-model-drafts/${draftId}/sections/someId/data-fields/someId`,
      )
      .set('Authorization', 'Bearer token1')
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PATCH data field draft ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId } = await setupToProveDraftOwnership();
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}/sections/someId/data-fields/someId`,
      )
      .set('Authorization', 'Bearer token1')
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/DELETE data field draft`, async () => {
    const organization = await createOrganization();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organization,
      user: authContext.user,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);
    await productDataModelDraftService.save(laptopDraft);
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${organization.id}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}/data-fields/${dataField.id}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.sections[0].dataFields).toEqual([]);
    const found = await productDataModelDraftService.findOne(response.body.id);
    expect(response.body).toEqual(found.toPlain());
  });

  it(`/DELETE data field ${userNotMemberTxt}`, async () => {
    const { orgaId, draftId, sectionId, dataFieldId } =
      await setupToProveMembership();
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${orgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}/data-fields/${dataFieldId}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  it(`/DELETE data field ${draftDoesNotBelongToOrga}`, async () => {
    const { otherOrgaId, draftId, sectionId, dataFieldId } =
      await setupToProveDraftOwnership();

    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${otherOrgaId}/product-data-model-drafts/${draftId}/sections/${sectionId}/data-fields/${dataFieldId}`,
      )
      .set('Authorization', 'Bearer token1');
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.close();
  });
});
