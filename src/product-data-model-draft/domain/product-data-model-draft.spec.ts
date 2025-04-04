import { ProductDataModelDraft } from './product-data-model-draft';
import { DataFieldDraft } from './data-field-draft';
import { DataSectionDraft } from './section-draft';
import { NotFoundError } from '../../exceptions/domain.errors';
import { SectionType } from '../../data-modelling/domain/section-base';
import { DataFieldType } from '../../data-modelling/domain/data-field-base';
import { User } from '../../users/domain/user';
import { randomUUID } from 'crypto';
import { Organization } from '../../organizations/domain/organization';
import { VisibilityLevel } from '../../product-data-model/domain/product.data.model';

describe('ProductDataModelDraft', () => {
  const user = new User(randomUUID(), 'test@example.com');
  const organization = Organization.create({ name: 'orga1', user: user });
  const laptopModel = {
    name: 'Laptop',
    version: '1.0.0',
    ownedByOrganizationId: organization.id,
    createdByUserId: user.id,
    sections: [
      {
        type: SectionType.GROUP,
        name: 'Umwelt',
        dataFields: [
          {
            type: 'TextField',
            name: 'Title',
            options: { max: 2 },
          },
          {
            type: 'TextField',
            name: 'Title 2',
            options: { min: 2 },
          },
        ],
        subSections: [],
      },
      {
        id: 'm1',
        name: 'Material',
        type: SectionType.REPEATABLE,
        dataFields: [
          {
            type: 'TextField',
            name: 'rep field 1',
            options: {},
          },
          {
            type: 'TextField',
            name: 'rep field 2',
            options: {},
          },
        ],
        subSections: ['m1.1'],
      },
      {
        id: 'm1.1',
        parentId: 'm1',
        name: 'Measurement',
        type: SectionType.GROUP,
        dataFields: [
          {
            type: 'TextField',
            name: 'rep field 1',
            options: {},
          },
          {
            type: 'TextField',
            name: 'rep field 2',
            options: {},
          },
        ],
        subSections: [],
      },
    ],
  };

  it('is created from laptopModel', () => {
    const productDataModelDraft = ProductDataModelDraft.fromPlain(laptopModel);
    expect(productDataModelDraft.toPlain()).toEqual({
      ...laptopModel,
      id: expect.any(String),
      publications: [],
      sections: laptopModel.sections.map((s) => ({
        id: expect.any(String),
        ...s,
        dataFields: s.dataFields.map((f) => ({ id: expect.any(String), ...f })),
      })),
    });
  });

  it('is renamed', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'My Draft',
      user,
      organization,
    });
    productDataModelDraft.rename('Final Draft');
    expect(productDataModelDraft.name).toEqual('Final Draft');
  });

  it('is published', () => {
    const productDataModelDraft = ProductDataModelDraft.fromPlain(laptopModel);
    const otherUser = new User(randomUUID(), 'test@example.com');
    const publishedProductDataModel = productDataModelDraft.publish(
      otherUser,
      VisibilityLevel.PUBLIC,
    );

    const expected = {
      name: productDataModelDraft.name,
      id: expect.any(String),
      version: '1.0.0',
      ownedByOrganizationId: organization.id,
      createdByUserId: otherUser.id,
      visibility: VisibilityLevel.PUBLIC,
      sections: [
        {
          parentId: undefined,
          subSections: [],
          id: expect.any(String),
          type: SectionType.GROUP,
          name: 'Umwelt',
          dataFields: [
            {
              id: expect.any(String),
              type: 'TextField',
              name: 'Title',
              options: { max: 2 },
            },
            {
              id: expect.any(String),
              type: 'TextField',
              name: 'Title 2',
              options: { min: 2 },
            },
          ],
        },
        {
          parentId: undefined,
          subSections: [expect.any(String)],
          name: 'Material',
          id: expect.any(String),
          type: SectionType.REPEATABLE,
          dataFields: [
            {
              id: expect.any(String),
              type: 'TextField',
              name: 'rep field 1',
              options: {},
            },
            {
              id: expect.any(String),
              type: 'TextField',
              name: 'rep field 2',
              options: {},
            },
          ],
        },
        {
          parentId: expect.any(String),
          subSections: [],
          name: 'Measurement',
          id: expect.any(String),
          type: SectionType.GROUP,
          dataFields: [
            {
              id: expect.any(String),
              type: 'TextField',
              name: 'rep field 1',
              options: {},
            },
            {
              id: expect.any(String),
              type: 'TextField',
              name: 'rep field 2',
              options: {},
            },
          ],
        },
      ],
    };
    expect(publishedProductDataModel.toPlain()).toEqual(expected);
    expect(publishedProductDataModel.id).not.toEqual(productDataModelDraft.id);
    expect(productDataModelDraft.publications).toEqual([
      {
        id: publishedProductDataModel.id,
        version: '1.0.0',
      },
    ]);
    const againPublished = productDataModelDraft.publish(
      otherUser,
      VisibilityLevel.PRIVATE,
    );
    expect(againPublished.version).toEqual('2.0.0');
    expect(productDataModelDraft.publications).toEqual([
      {
        id: publishedProductDataModel.id,
        version: '1.0.0',
      },
      {
        id: againPublished.id,
        version: '2.0.0',
      },
    ]);
    const parentSection = publishedProductDataModel.sections.find(
      (s) => s.name === 'Material',
    );
    const childSection = publishedProductDataModel.sections.find(
      (s) => s.name === 'Measurement',
    );
    expect(parentSection.subSections).toEqual([childSection.id]);
    expect(childSection.parentId).toEqual(parentSection.id);
  });

  it('should be created', () => {
    const user = new User(randomUUID(), 'test@example.com');
    const organization = Organization.create({ name: 'orga1', user: user });
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Handy',
      organization,
      user,
    });
    expect(productDataModelDraft.id).toBeDefined();
    expect(productDataModelDraft.version).toEqual('1.0.0');
    expect(productDataModelDraft.sections).toEqual([]);
    expect(productDataModelDraft.isOwnedBy(organization)).toBeTruthy();
    expect(productDataModelDraft.createdByUserId).toEqual(user.id);
    expect(productDataModelDraft.publications).toEqual([]);
  });

  it('should add sections', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organization,
      user,
    });
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const section2 = DataSectionDraft.create({
      name: 'Material',
      type: SectionType.REPEATABLE,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSection(section2);

    expect(productDataModelDraft.sections).toEqual([section1, section2]);
  });

  it('should add subSection', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organization,
      user,
    });
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const section2 = DataSectionDraft.create({
      name: 'Material',
      type: SectionType.REPEATABLE,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSubSection(section1.id, section2);

    expect(productDataModelDraft.toPlain().sections).toEqual([
      { ...section1.toPlain(), subSections: [section2.id] },
      { ...section2.toPlain(), parentId: section1.id },
    ]);
  });

  it('should fail to add subSection if parent id not found', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organization,
      user,
    });
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });

    expect(() =>
      productDataModelDraft.addSubSection('some id', section1),
    ).toThrow(new NotFoundError(DataSectionDraft.name, 'some id'));
  });

  it('should modify section', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organization,
      user,
    });
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    productDataModelDraft.addSection(section);
    productDataModelDraft.modifySection(section.id, { name: 'Tracebility' });

    expect(productDataModelDraft.toPlain().sections).toEqual([
      { ...section.toPlain(), name: 'Tracebility' },
    ]);
  });

  it('should delete a section', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organization,
      user,
    });
    const section1 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    const section11 = DataSectionDraft.create({
      name: 'Dimensions',
      type: SectionType.GROUP,
    });
    const section111 = DataSectionDraft.create({
      name: 'Measurement',
      type: SectionType.GROUP,
    });
    const section112 = DataSectionDraft.create({
      name: 'Measurement 2',
      type: SectionType.GROUP,
    });
    const section2 = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    productDataModelDraft.addSection(section1);
    productDataModelDraft.addSubSection(section1.id, section11);
    productDataModelDraft.addSubSection(section11.id, section111);
    productDataModelDraft.addSubSection(section11.id, section112);

    productDataModelDraft.addSection(section2);

    productDataModelDraft.deleteSection(section1.id);

    expect(productDataModelDraft.sections).toEqual([section2]);
  });

  it('should fail to delete a section if it could not be found', () => {
    const productDataModelDraft = ProductDataModelDraft.create({
      name: 'Laptop',
      organization,
      user,
    });
    const section = DataSectionDraft.create({
      name: 'Technical specification',
      type: SectionType.GROUP,
    });
    productDataModelDraft.addSection(section);

    expect(() => productDataModelDraft.deleteSection('unknown-id')).toThrow(
      new NotFoundError(DataSectionDraft.name, 'unknown-id'),
    );
  });

  it('should add field', () => {
    const productDataModelDraft = ProductDataModelDraft.fromPlain({
      id: 'product-1',
      name: 'Laptop',
      version: '1.0',
      ownedByOrganizationId: organization.id,
      createdByUserId: user.id,
      sections: [
        {
          id: 'section-1',
          name: 'Section 1',
          type: SectionType.GROUP,
          dataFields: [],
        },
        {
          id: 'section-2',
          name: 'Section 2',
          type: SectionType.REPEATABLE,
          dataFields: [],
        },
      ],
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });

    productDataModelDraft.addDataFieldToSection('section-1', dataField1);
    productDataModelDraft.addDataFieldToSection('section-1', dataField2);

    expect(
      productDataModelDraft.findSectionOrFail('section-1').dataFields,
    ).toEqual([dataField1, dataField2]);

    expect(() =>
      productDataModelDraft.addDataFieldToSection('section-3', dataField1),
    ).toThrow(new NotFoundError(DataSectionDraft.name, 'section-3'));
  });

  it('should add field', () => {
    const productDataModelDraft = ProductDataModelDraft.fromPlain({
      id: 'product-1',
      name: 'Laptop',
      version: '1.0',
      ownedByOrganizationId: organization.id,
      createdByUserId: user.id,
      sections: [
        {
          id: 'section-1',
          name: 'Section 1',
          type: SectionType.GROUP,
          dataFields: [],
        },
        {
          id: 'section-2',
          name: 'Section 2',
          type: SectionType.REPEATABLE,
          dataFields: [],
        },
      ],
    });
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });

    productDataModelDraft.addDataFieldToSection('section-1', dataField1);
    productDataModelDraft.addDataFieldToSection('section-1', dataField2);

    expect(
      productDataModelDraft.findSectionOrFail('section-1').dataFields,
    ).toEqual([dataField1, dataField2]);

    expect(() =>
      productDataModelDraft.addDataFieldToSection('section-3', dataField1),
    ).toThrow(new NotFoundError(DataSectionDraft.name, 'section-3'));
  });

  it('should delete data field', () => {
    const dataField1 = DataFieldDraft.create({
      name: 'Processor',
      type: DataFieldType.TEXT_FIELD,
    });
    const dataField2 = DataFieldDraft.create({
      name: 'Memory',
      type: DataFieldType.TEXT_FIELD,
    });
    const productDataModelDraft = ProductDataModelDraft.fromPlain({
      id: 'product-1',
      name: 'Laptop',
      version: '1.0',
      ownedByOrganizationId: organization.id,
      createdByUserId: user.id,
      sections: [
        {
          id: 'section-1',
          name: 'Section 1',
          type: SectionType.GROUP,
          dataFields: [dataField1, dataField2],
        },
        {
          id: 'section-2',
          name: 'Section 2',
          type: SectionType.REPEATABLE,
          dataFields: [],
        },
      ],
    });

    productDataModelDraft.deleteDataFieldOfSection('section-1', dataField1.id);
    expect(
      productDataModelDraft.findSectionOrFail('section-1').dataFields,
    ).toEqual([dataField2]);
  });
});
