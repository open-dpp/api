import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthTestingGuard } from '../../../test/keycloak-auth.guard.testing';
import { AuthContext } from '../../auth/auth-request';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { ProductDataModelDraftModule } from '../product-data-model-draft.module';
import { KeycloakResourcesService } from '../../keycloak-resources/infrastructure/keycloak-resources.service';
import { KeycloakResourcesServiceTesting } from '../../../test/keycloak.resources.service.testing';
import { ProductDataModelDraft } from '../domain/product-data-model-draft';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataSectionDraft } from '../domain/section-draft';
import { DataFieldDraft } from '../domain/data-field-draft';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { VisibilityLevel } from '../../product-data-model/domain/product.data.model';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDataModelDraftDoc,
  ProductDataModelDraftSchema,
} from '../infrastructure/product-data-model-draft.schema';
import { MongooseTestingModule } from '../../../test/mongo.testing.module';
import { ProductDataModelDraftService } from '../infrastructure/product-data-model-draft.service';
import {
  ProductDataModelDoc,
  ProductDataModelSchema,
} from '../../product-data-model/infrastructure/product-data-model.schema';
import getKeycloakAuthToken from '../../../test/auth-token-helper.testing';

import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { productDataModelDraftToDto } from './dto/product-data-model-draft.dto';
import { sectionToDto } from '../../data-modelling/presentation/dto/section-base.dto';

describe('ProductsDataModelDraftController', () => {
  let app: INestApplication;
  const authContext = new AuthContext();
  let productDataModelDraftService: ProductDataModelDraftService;
  let productDataModelService: ProductDataModelService;
  authContext.user = new User(randomUUID(), 'test@test.test');
  const userId = authContext.user.id;
  const organizationId = randomUUID();
  const otherOrganizationId = randomUUID();
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());
  const newConfig = { xs: 1, sm: 2, md: 4, lg: 4, xl: 8 };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseTestingModule,
        MongooseModule.forFeature([
          {
            name: ProductDataModelDraftDoc.name,
            schema: ProductDataModelDraftSchema,
          },
          {
            name: ProductDataModelDoc.name,
            schema: ProductDataModelSchema,
          },
        ]),
        ProductDataModelDraftModule,
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
          users: [{ id: authContext.user.id, email: authContext.user.email }],
        }),
      )
      .compile();

    app = moduleRef.createNestApplication();

    productDataModelService = moduleRef.get<ProductDataModelService>(
      ProductDataModelService,
    );
    productDataModelDraftService = moduleRef.get<ProductDataModelDraftService>(
      ProductDataModelDraftService,
    );

    await app.init();
  });

  const userNotMemberTxt = `fails if user is not member of organization`;
  const draftDoesNotBelongToOrga = `fails if draft does not belong to organization`;

  it(`/CREATE product data model draft`, async () => {
    const body = { name: 'My first draft' };
    const response = await request(app.getHttpServer())
      .post(`/organizations/${organizationId}/product-data-model-drafts`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(response.body).toEqual(productDataModelDraftToDto(found));
  });

  it(`/CREATE product data model draft ${userNotMemberTxt}`, async () => {
    const body = { name: 'My first draft' };

    const response = await request(app.getHttpServer())
      .post(`/organizations/${otherOrganizationId}/product-data-model-drafts`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PATCH product data model draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    await productDataModelDraftService.save(laptopDraft);
    const body = { name: 'My final laptop draft' };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...productDataModelDraftToDto(laptopDraft),
      ...body,
    });
  });

  it(`/PATCH product data model draft ${userNotMemberTxt}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId: randomUUID(),
    });

    await productDataModelDraftService.save(laptopDraft);
    const body = { name: 'My final laptop draft' };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${laptopDraft.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PATCH product data model draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = { name: 'My final laptop draft' };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PUBLISH product data model draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
      layout: Layout.create({ ...layoutWithoutCols, cols: { sm: 2 } }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);

    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout: Layout.create({ ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);
    await productDataModelDraftService.save(laptopDraft);
    const body = { visibility: VisibilityLevel.PUBLIC };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/publish`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(201);
    const foundDraft = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(foundDraft.publications).toEqual([
      { id: expect.any(String), version: '1.0.0' },
    ]);
    const foundModel = await productDataModelService.findOneOrFail(
      foundDraft.publications[0].id,
    );
    expect(foundModel.id).toEqual(foundDraft.publications[0].id);
  });

  it(`/PUBLISH product data model draft ${userNotMemberTxt}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    const body = { visibility: VisibilityLevel.PUBLIC };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${laptopDraft}/publish`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PUBLISH product data model draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = { visibility: VisibilityLevel.PUBLIC };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/publish`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/GET product data model drafts of organization`, async () => {
    const myOrgaId = randomUUID();
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: myOrgaId,
      userId,
    });
    const phoneDraft = ProductDataModelDraft.create({
      name: 'phone',
      organizationId: myOrgaId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    await productDataModelDraftService.save(phoneDraft);
    const response = await request(app.getHttpServer())
      .get(`/organizations/${myOrgaId}/product-data-model-drafts`)
      .set(
        'Authorization',
        getKeycloakAuthToken(userId, [myOrgaId], keycloakAuthTestingGuard),
      );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      { id: laptopDraft.id, name: laptopDraft.name },
      { id: phoneDraft.id, name: phoneDraft.name },
    ]);
  });

  it(`/GET product data model drafts of organization ${userNotMemberTxt}`, async () => {
    const response = await request(app.getHttpServer())
      .get(`/organizations/${otherOrganizationId}/product-data-model-drafts`)
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/CREATE section draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = {
      name: 'Technical Specs',
      type: SectionType.GROUP,
      layout: {
        colStart: { sm: 2 },
        colSpan: { sm: 1 },
        rowStart: { sm: 3 },
        rowSpan: { sm: 3 },
        cols: { sm: 3 },
      },
      granularityLevel: GranularityLevel.MODEL,
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.sections).toEqual([
      {
        name: 'Technical Specs',
        type: SectionType.GROUP,
        granularityLevel: GranularityLevel.MODEL,
        id: expect.any(String),
        dataFields: [],
        subSections: [],
        layout: {
          colStart: { sm: 2 },
          colSpan: { sm: 1 },
          rowStart: { sm: 3 },
          rowSpan: { sm: 3 },
          cols: { sm: 3 },
        },
      },
    ]);
    const foundDraft = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(response.body).toEqual(productDataModelDraftToDto(foundDraft));
  });

  const layoutWithoutCols = {
    colStart: { sm: 2 },
    colSpan: { lg: 1, sm: 1 },
    rowStart: { sm: 3 },
    rowSpan: { sm: 3 },
  };

  it(`/CREATE sub section draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
      layout: Layout.create({ cols: { sm: 2 }, ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);

    await productDataModelDraftService.save(laptopDraft);

    const body = {
      name: 'Dimensions',
      type: SectionType.GROUP,
      parentSectionId: section.id,
      layout: {
        cols: { sm: 3 },
        colStart: { sm: 2 },
        colSpan: { lg: 1, sm: 1 },
        rowStart: { lg: 1, sm: 1 },
        rowSpan: { lg: 1, sm: 1 },
      },
      granularityLevel: GranularityLevel.MODEL,
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(201);
    // expect draft data
    const expectedSectionsBody = [
      { ...sectionToDto(section), subSections: [expect.any(String)] },
      {
        name: 'Dimensions',
        type: SectionType.GROUP,
        id: expect.any(String),
        dataFields: [],
        subSections: [],
        parentId: section.id,
        layout: {
          cols: { sm: 3 },
          colStart: { sm: 2 },
          colSpan: { lg: 1, sm: 1 },
          rowStart: { lg: 1, sm: 1 },
          rowSpan: { lg: 1, sm: 1 },
        },
        granularityLevel: GranularityLevel.MODEL,
      },
    ];
    expect(response.body.sections).toEqual(expectedSectionsBody);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(response.body.sections).toEqual(
      productDataModelDraftToDto(found).sections,
    );
  });

  it(`/CREATE section draft ${userNotMemberTxt}`, async () => {
    const body = {
      name: 'Dimensions',
      type: SectionType.GROUP,
      parentSectionId: undefined,
      layout: {
        cols: { sm: 3 },
        colStart: { sm: 2 },
        colSpan: { lg: 1, sm: 1 },
        rowStart: { lg: 1, sm: 1 },
        rowSpan: { lg: 1, sm: 1 },
      },
      granularityLevel: GranularityLevel.MODEL,
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${randomUUID()}/sections`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/CREATE section draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = {
      name: 'Dimensions',
      type: SectionType.GROUP,
      parentSectionId: undefined,
      layout: {
        cols: { sm: 3 },
        colStart: { sm: 2 },
        colSpan: { lg: 1, sm: 1 },
        rowStart: { lg: 1, sm: 1 },
        rowSpan: { lg: 1, sm: 1 },
      },
      granularityLevel: GranularityLevel.MODEL,
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/GET draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
      layout: Layout.create({ cols: { sm: 2 }, ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);

    await productDataModelDraftService.save(laptopDraft);
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(response.body).toEqual(productDataModelDraftToDto(found));
  });

  it(`/GET draft ${userNotMemberTxt}`, async () => {
    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${randomUUID()}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/GET draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);

    const response = await request(app.getHttpServer())
      .get(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/PATCH section draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
      layout: Layout.create({ cols: { sm: 2 }, ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);

    await productDataModelDraftService.save(laptopDraft);

    const body = {
      name: 'Technical Specs',
      layout: {
        cols: newConfig,
        rowSpan: newConfig,
        rowStart: newConfig,
        colStart: newConfig,
        colSpan: newConfig,
      },
    };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(sectionToDto(found.findSectionOrFail(section.id))).toEqual({
      ...sectionToDto(section),
      name: body.name,
      layout: body.layout,
    });
  });

  it(`/PATCH section draft ${userNotMemberTxt}`, async () => {
    const body = {
      name: 'Technical Specs',
      layout: {
        cols: newConfig,
        rowSpan: newConfig,
        rowStart: newConfig,
        colStart: newConfig,
        colSpan: newConfig,
      },
    };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${randomUUID()}/sections/${randomUUID()}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PATCH section draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = {
      name: 'Technical Specs',
      layout: {
        cols: newConfig,
        rowSpan: newConfig,
        rowStart: newConfig,
        colStart: newConfig,
        colSpan: newConfig,
      },
    };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${randomUUID()}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/DELETE section draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
      layout: Layout.create({ cols: { sm: 2 }, ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);
    await productDataModelDraftService.save(laptopDraft);
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(found.sections).toEqual([]);
  });

  it(`/DELETE section draft ${userNotMemberTxt}`, async () => {
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${randomUUID()}/sections/${randomUUID()}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/DELETE section draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);

    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${randomUUID()}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/CREATE data field draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
      layout: Layout.create({ cols: { sm: 2 }, ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);

    await productDataModelDraftService.save(laptopDraft);

    const body = {
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { min: 2 },
      layout: {
        ...layoutWithoutCols,
      },
      granularityLevel: GranularityLevel.MODEL,
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}/data-fields`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.sections[0].dataFields).toEqual([
      {
        name: 'Processor',
        type: DataFieldType.TEXT_FIELD,
        id: expect.any(String),
        options: { min: 2 },
        layout: layoutWithoutCols,
        granularityLevel: GranularityLevel.MODEL,
      },
    ]);
    const foundDraft = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(response.body).toEqual(productDataModelDraftToDto(foundDraft));
  });

  it(`/CREATE data field draft ${userNotMemberTxt}`, async () => {
    const body = {
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { min: 2 },
      layout: {
        ...layoutWithoutCols,
      },
      granularityLevel: GranularityLevel.MODEL,
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${randomUUID()}/sections/${randomUUID()}/data-fields`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/CREATE data field draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = {
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { min: 2 },
      layout: {
        ...layoutWithoutCols,
      },
      granularityLevel: GranularityLevel.MODEL,
    };
    const response = await request(app.getHttpServer())
      .post(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${randomUUID()}/data-fields`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PATCH data field draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
      layout: Layout.create({ cols: { sm: 2 }, ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout: Layout.create({ ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);

    await productDataModelDraftService.save(laptopDraft);

    const newConfig = { xs: 1, sm: 2, md: 4, lg: 4, xl: 8 };

    const body = {
      name: 'Memory',
      options: { max: 8 },
      layout: {
        rowSpan: newConfig,
        rowStart: newConfig,
        colStart: newConfig,
        colSpan: newConfig,
      },
    };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}/data-fields/${dataField.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(200);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(found.sections[0].dataFields).toEqual([
      {
        ...dataField,
        _name: body.name,
        options: body.options,
        layout: body.layout,
      },
    ]);
  });

  it(`/PATCH data field draft ${userNotMemberTxt}`, async () => {
    const body = {
      name: 'Memory',
      options: { max: 8 },
      layout: {
        rowSpan: newConfig,
        rowStart: newConfig,
        colStart: newConfig,
        colSpan: newConfig,
      },
    };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${randomUUID()}/sections/someId/data-fields/someId`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/PATCH data field draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
    const body = {
      name: 'Memory',
      options: { max: 8 },
      layout: {
        rowSpan: newConfig,
        rowStart: newConfig,
        colStart: newConfig,
        colSpan: newConfig,
      },
    };
    const response = await request(app.getHttpServer())
      .patch(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/someId/data-fields/someId`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      )
      .send(body);
    expect(response.status).toEqual(403);
  });

  it(`/DELETE data field draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
      layout: Layout.create({ cols: { sm: 2 }, ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addSection(section);

    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      layout: Layout.create({ ...layoutWithoutCols }),
      granularityLevel: GranularityLevel.MODEL,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);

    await productDataModelDraftService.save(laptopDraft);
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${section.id}/data-fields/${dataField.id}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.sections[0].dataFields).toEqual([]);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.id,
    );
    expect(response.body).toEqual(productDataModelDraftToDto(found));
  });

  it(`/DELETE data field ${userNotMemberTxt}`, async () => {
    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${otherOrganizationId}/product-data-model-drafts/${randomUUID()}/sections/${randomUUID()}/data-fields/${randomUUID()}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  it(`/DELETE data field ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);

    const response = await request(app.getHttpServer())
      .delete(
        `/organizations/${organizationId}/product-data-model-drafts/${laptopDraft.id}/sections/${randomUUID()}/data-fields/${randomUUID()}`,
      )
      .set(
        'Authorization',
        getKeycloakAuthToken(
          userId,
          [organizationId, otherOrganizationId],
          keycloakAuthTestingGuard,
        ),
      );
    expect(response.status).toEqual(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
