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
import { getViewSchema, ViewDoc } from '../../view/infrastructure/view.schema';
import { ViewService } from '../../view/infrastructure/view.service';
import {
  DataFieldRef,
  isDataFieldRef,
  isSectionGrid,
  SectionGrid,
} from '../../view/domain/node';
import { TargetGroup, View } from '../../view/domain/view';
import { ignoreIds } from '../../../test/utils';

describe('ProductsDataModelDraftController', () => {
  let app: INestApplication;
  const authContext = new AuthContext();
  let productDataModelDraftService: ProductDataModelDraftService;
  let productDataModelService: ProductDataModelService;
  let viewService: ViewService;
  authContext.user = new User(randomUUID(), 'test@test.test');
  const userId = authContext.user.id;
  const organizationId = randomUUID();
  const otherOrganizationId = randomUUID();
  const keycloakAuthTestingGuard = new KeycloakAuthTestingGuard(new Map());

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
        MongooseModule.forFeatureAsync([
          {
            name: ViewDoc.name,
            useFactory: () => getViewSchema(),
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
    viewService = moduleRef.get<ViewService>(ViewService);

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
    expect(response.body.data.id).toBeDefined();
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.data.id,
    );
    expect(response.body.data).toEqual(found.toPlain());
    const foundView = await viewService.findOneOrFail(response.body.view.id);
    expect(foundView.dataModelId).toEqual(response.body.data.id);
    expect(response.body.view).toEqual(foundView.toPlain());
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
    const view = View.create({
      targetGroup: TargetGroup.ALL,
      dataModelId: laptopDraft.id,
    });
    await viewService.save(view);
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
    expect(response.body.data).toEqual({ ...laptopDraft.toPlain(), ...body });
    expect(response.body.view).toEqual(view.toPlain());
  });

  it(`/PATCH product data model draft ${userNotMemberTxt}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId: randomUUID(),
    });
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
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/PATCH product data model draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);
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
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/PUBLISH product data model draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const view = View.create({
      targetGroup: TargetGroup.ALL,
      dataModelId: laptopDraft.id,
    });

    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);

    const sectionGrid = SectionGrid.create({
      sectionId: section.id,
      cols: { xs: 1 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid);

    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);

    const dataFieldRef = DataFieldRef.create({
      fieldId: dataField.id,
      ...colStartAndSpan,
    });

    view.addNode(dataFieldRef, sectionGrid.id);

    await viewService.save(view);
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
      response.body.data.id,
    );
    expect(foundDraft.publications).toEqual([
      { id: expect.any(String), version: '1.0.0' },
    ]);
    const foundModel = await productDataModelService.findOneOrFail(
      foundDraft.publications[0].id,
    );
    expect(foundModel.id).toEqual(foundDraft.publications[0].id);

    const foundView = await viewService.findOneByDataModelAndTargetGroupOrFail(
      foundModel.id,
      TargetGroup.ALL,
    );
    expect(foundView.dataModelId).toEqual(foundModel.id);
    expect(foundView.id).not.toEqual(response.body.view.id);

    expect(response.body.view).toEqual(view);
  });

  it(`/PUBLISH product data model draft ${userNotMemberTxt}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
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
      );
    expect(response.status).toEqual(403);
  });

  it(`/PUBLISH product data model draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);

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
      );
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

    await viewService.save(
      View.create({
        targetGroup: TargetGroup.ALL,
        dataModelId: laptopDraft.id,
      }),
    );

    const body = {
      name: 'Technical Specs',
      type: SectionType.GROUP,
      view: {
        colStart: { md: 2 },
        colSpan: { md: 1 },
        cols: { md: 3 },
      },
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
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.sections).toEqual([
      {
        name: 'Technical Specs',
        type: SectionType.GROUP,
        id: expect.any(String),
        dataFields: [],
        subSections: [],
      },
    ]);
    const foundDraft = await productDataModelDraftService.findOneOrFail(
      response.body.data.id,
    );
    expect(response.body.data).toEqual(foundDraft.toPlain());
    const foundView = await viewService.findOneOrFail(response.body.view.id);
    expect(foundView.nodes).toEqual(
      ignoreIds([
        SectionGrid.create({
          colStart: { md: 2 },
          colSpan: { md: 1 },
          cols: { md: 3 },
          sectionId: foundDraft.sections[0].id,
        }),
      ]),
    );
    expect(response.body.view).toEqual(foundView.toPlain());
  });

  const colStartAndSpan = { colStart: { xs: 2 }, colSpan: { lg: 1, sm: 1 } };

  it(`/CREATE sub section draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    const view = View.create({
      targetGroup: TargetGroup.ALL,
      dataModelId: laptopDraft.id,
    });

    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    const sectionGrid = SectionGrid.create({
      sectionId: section.id,
      cols: { md: 2 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid);

    await productDataModelDraftService.save(laptopDraft);
    await viewService.save(view);

    const body = {
      name: 'Dimensions',
      type: SectionType.GROUP,
      parentSectionId: section.id,
      view: {
        cols: { xs: 3 },
        colStart: { xs: 2 },
        colSpan: { lg: 1, sm: 1 },
        rowStart: { lg: 1, sm: 1 },
        rowSpan: { lg: 1, sm: 1 },
      },
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
      { ...section.toPlain(), subSections: [expect.any(String)] },
      {
        name: 'Dimensions',
        type: SectionType.GROUP,
        id: expect.any(String),
        dataFields: [],
        subSections: [],
        parentId: section.id,
      },
    ];
    expect(response.body.data.sections).toEqual(expectedSectionsBody);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.data.id,
    );
    expect(response.body.data.sections).toEqual(found.toPlain().sections);
    const createdSectionId = response.body.data.sections[1].id;

    // expect view
    const foundView = await viewService.findOneOrFail(response.body.view.id);
    const foundNodes =
      foundView.findNodeWithParentBySectionId(createdSectionId);
    const expected = SectionGrid.create({
      sectionId: createdSectionId,
      cols: { xs: 3 },
      colStart: { xs: 2 },
      colSpan: { lg: 1, sm: 1 },
      rowStart: { lg: 1, sm: 1 },
      rowSpan: { lg: 1, sm: 1 },
    });
    expected.assignParent(sectionGrid.id);
    expect(foundNodes.node).toEqual(ignoreIds(expected));
    expect(foundNodes.parent.id).toEqual(sectionGrid.id);
  });

  it(`/CREATE section draft ${userNotMemberTxt}`, async () => {
    const body = { name: 'Technical Specs', type: SectionType.GROUP };
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
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/GET draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const view = View.create({
      dataModelId: laptopDraft.id,
      targetGroup: TargetGroup.ALL,
    });

    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);

    const sectionGrid = SectionGrid.create({
      ...colStartAndSpan,
      sectionId: section.id,
      cols: { xs: 1 },
    });
    view.addNode(sectionGrid);

    await viewService.save(view);
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
      response.body.data.id,
    );
    expect(response.body.data).toEqual(found.toPlain());
    expect(response.body.view).toEqual(view.toPlain());
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

    const view = View.create({
      targetGroup: TargetGroup.ALL,
      dataModelId: laptopDraft.id,
    });

    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);

    const sectionGrid = SectionGrid.create({
      sectionId: section.id,
      cols: { md: 2 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid);

    await viewService.save(view);
    await productDataModelDraftService.save(laptopDraft);
    const newConfig = { xs: 1, sm: 2, md: 4, lg: 4, xl: 8 };
    const body = {
      name: 'Technical Specs',
      view: {
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
      response.body.data.id,
    );
    expect(found.findSectionOrFail(section.id).toPlain()).toEqual({
      ...section.toPlain(),
      name: body.name,
    });
    const foundView = await viewService.findOneOrFail(response.body.view.id);
    const { node } = foundView.findNodeWithParentBySectionId(section.id);
    expect(node.rowStart).toEqual(newConfig);
    expect(node.rowSpan).toEqual(newConfig);
    expect(node.colStart).toEqual(newConfig);
    expect(node.colSpan).toEqual(newConfig);
    expect(isSectionGrid(node) && node.cols).toEqual(newConfig);
  });

  it(`/PATCH section draft ${userNotMemberTxt}`, async () => {
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
      );
    expect(response.status).toEqual(403);
  });

  it(`/PATCH section draft ${draftDoesNotBelongToOrga}`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId: otherOrganizationId,
      userId,
    });
    await productDataModelDraftService.save(laptopDraft);

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
      );
    expect(response.status).toEqual(403);
  });

  it(`/DELETE section draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });
    const view = View.create({
      dataModelId: laptopDraft.id,
      targetGroup: TargetGroup.ALL,
    });
    const section = DataSectionDraft.create({
      name: 'Tecs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);
    const sectionGrid = SectionGrid.create({
      sectionId: section.id,
      cols: { md: 3 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid);
    await viewService.save(view);
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
      response.body.data.id,
    );
    expect(found.sections).toEqual([]);
    const foundView = await viewService.findOneOrFail(response.body.view.id);
    expect(
      foundView.findNodeWithParentBySectionId(section.id).node,
    ).toBeUndefined();
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
    });
    laptopDraft.addSection(section);

    const view = View.create({
      targetGroup: TargetGroup.ALL,
      dataModelId: laptopDraft.id,
    });
    const sectionGrid = SectionGrid.create({
      sectionId: section.id,
      cols: { md: 2 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid);

    await viewService.save(view);
    await productDataModelDraftService.save(laptopDraft);

    const body = {
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
      options: { min: 2 },
      view: {
        ...colStartAndSpan,
      },
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
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.sections[0].dataFields).toEqual([
      {
        name: 'Processor',
        type: DataFieldType.TEXT_FIELD,
        id: expect.any(String),
        options: { min: 2 },
      },
    ]);
    const foundDraft = await productDataModelDraftService.findOneOrFail(
      response.body.data.id,
    );
    expect(response.body.data).toEqual(foundDraft.toPlain());
    const foundView = await viewService.findOneOrFail(response.body.view.id);
    const { node } = foundView.findNodeWithParentById(sectionGrid.id);
    expect(node.children).toHaveLength(1);
    const { node: dataFieldRef } = foundView.findNodeWithParentById(
      node.children[0],
    );
    expect(isDataFieldRef(dataFieldRef) && dataFieldRef).toMatchObject({
      fieldId: foundDraft.findSectionOrFail(section.id).dataFields[0].id,
      ...colStartAndSpan,
    });
  });

  it(`/CREATE data field draft ${userNotMemberTxt}`, async () => {
    const body = { name: 'Processor', type: SectionType.GROUP };
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
      .send({});
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
    });
    laptopDraft.addSection(section);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);

    const view = View.create({
      targetGroup: TargetGroup.ALL,
      dataModelId: laptopDraft.id,
    });
    const sectionGrid = SectionGrid.create({
      sectionId: section.id,
      cols: { md: 2 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid);

    const dataFieldRef = DataFieldRef.create({
      fieldId: dataField.id,
      ...colStartAndSpan,
    });
    view.addNode(dataFieldRef, sectionGrid.id);

    await viewService.save(view);
    await productDataModelDraftService.save(laptopDraft);

    const newConfig = { xs: 1, sm: 2, md: 4, lg: 4, xl: 8 };

    const body = {
      name: 'Memory',
      options: { max: 8 },
      view: {
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
      response.body.data.id,
    );
    expect(found.sections[0].dataFields).toEqual([
      { ...dataField, _name: body.name, options: body.options },
    ]);

    const foundView = await viewService.findOneOrFail(response.body.view.id);
    const { node } = foundView.findNodeWithParentByFieldId(dataField.id);
    expect(node.rowStart).toEqual(newConfig);
    expect(node.rowSpan).toEqual(newConfig);
    expect(node.colStart).toEqual(newConfig);
    expect(node.colSpan).toEqual(newConfig);
  });

  it(`/PATCH data field draft ${userNotMemberTxt}`, async () => {
    const body = { name: 'Memory', options: { max: 8 } };
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
      .send({});
    expect(response.status).toEqual(403);
  });

  it(`/DELETE data field draft`, async () => {
    const laptopDraft = ProductDataModelDraft.create({
      name: 'laptop',
      organizationId,
      userId,
    });

    const view = View.create({
      dataModelId: laptopDraft.id,
      targetGroup: TargetGroup.ALL,
    });

    const section = DataSectionDraft.create({
      name: 'Technical Specs',
      type: SectionType.GROUP,
    });
    laptopDraft.addSection(section);

    const sectionGrid = SectionGrid.create({
      sectionId: section.id,
      cols: { xs: 2 },
      ...colStartAndSpan,
    });
    view.addNode(sectionGrid);
    const dataField = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    laptopDraft.addDataFieldToSection(section.id, dataField);
    const dataFieldRef = DataFieldRef.create({
      fieldId: dataField.id,
      ...colStartAndSpan,
    });
    view.addNode(dataFieldRef, sectionGrid.id);

    await viewService.save(view);
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
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.sections[0].dataFields).toEqual([]);
    const found = await productDataModelDraftService.findOneOrFail(
      response.body.data.id,
    );
    expect(response.body.data).toEqual(found.toPlain());

    const foundView = await viewService.findOneOrFail(response.body.view.id);
    expect(
      foundView.findNodeWithParentByFieldId(dataField.id).node,
    ).toBeUndefined();
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
