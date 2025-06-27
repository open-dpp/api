import { randomUUID } from 'crypto';
import { DataFieldDraft } from './data-field-draft';
import { DataSectionDraft } from './section-draft';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../../product-data-model/domain/product.data.model';
import * as semver from 'semver';
import { LayoutProps } from '../../data-modelling/domain/layout';
import { SectionType } from '../../data-modelling/domain/section-base';

export type Publication = {
  id: string;
  version: string;
};

export type ProductDataModelDraftDbProps = {
  id: string;
  name: string;
  version: string;
  publications: Publication[];
  organizationId: string;
  userId: string;
  sections: DataSectionDraft[];
};

export class ProductDataModelDraft {
  private constructor(
    public readonly id: string,
    private _name: string,
    public readonly version: string,
    private readonly _publications: Publication[],
    private _ownedByOrganizationId: string | undefined,
    private _createdByUserId: string | undefined,
    private _sections: DataSectionDraft[],
  ) {}

  static create(data: {
    name: string;
    userId: string;
    organizationId: string;
  }) {
    return new ProductDataModelDraft(
      randomUUID(),
      data.name,
      '1.0.0',
      [],
      data.organizationId,
      data.userId,
      [],
    );
  }

  get sections() {
    return this._sections;
  }

  public isOwnedBy(organizationId: string) {
    return this._ownedByOrganizationId === organizationId;
  }

  get name() {
    return this._name;
  }

  public get createdByUserId() {
    return this._createdByUserId;
  }

  public get publications() {
    return this._publications;
  }

  public get ownedByOrganizationId() {
    return this._ownedByOrganizationId;
  }

  static loadFromDb(data: ProductDataModelDraftDbProps): ProductDataModelDraft {
    return new ProductDataModelDraft(
      data.id,
      data.name,
      data.version,
      data.publications,
      data.organizationId,
      data.userId,
      data.sections,
    );
  }

  rename(newName: string) {
    this._name = newName;
  }

  deleteSection(sectionId: string) {
    const { section, parent } = this.findSectionWithParent(sectionId);
    if (!section) {
      throw new ValueError(
        `Could not found and delete section with id ${sectionId}`,
      );
    }
    if (parent) {
      parent.deleteSubSection(section);
    }
    for (const childSectionId of section.subSections) {
      this.deleteSection(childSectionId);
    }
    this._sections = this.sections.filter((s) => s.id !== section.id);
  }

  modifySection(
    sectionId: string,
    data: { name?: string; layout: Partial<LayoutProps> },
  ) {
    const section = this.findSectionOrFail(sectionId);
    if (data.name) {
      section.rename(data.name);
    }
    section.layout.modify(data.layout);
  }

  modifyDataField(
    sectionId: string,
    dataFieldId: string,
    data: {
      name?: string;
      options?: Record<string, unknown>;
      layout: Partial<LayoutProps>;
    },
  ) {
    this.findSectionOrFail(sectionId).modifyDataField(dataFieldId, data);
  }

  addDataFieldToSection(sectionId: string, dataField: DataFieldDraft) {
    this.findSectionOrFail(sectionId).addDataField(dataField);
  }

  deleteDataFieldOfSection(sectionId: string, dataFieldId: string) {
    this.findSectionOrFail(sectionId).deleteDataField(dataFieldId);
  }

  findSectionOrFail(sectionId: string) {
    const { section } = this.findSectionWithParent(sectionId);
    if (!section) {
      throw new NotFoundError(DataSectionDraft.name, sectionId);
    }
    return section;
  }

  findSectionWithParent(sectionId: string) {
    const section = this.sections.find((s) => s.id === sectionId);
    const parent = section?.parentId
      ? this.sections.find((s) => s.id === section.parentId)
      : undefined;
    return { section, parent };
  }

  addSubSection(parentSectionId: string, section: DataSectionDraft) {
    const parentSection = this.findSectionOrFail(parentSectionId);
    if (
      section.granularityLevel &&
      parentSection.granularityLevel &&
      section.granularityLevel !== parentSection.granularityLevel
    ) {
      throw new ValueError(
        `Sub section ${section.id} has a granularity level of ${section.granularityLevel} which does not match the parent section's  granularity level of ${parentSection.granularityLevel}`,
      );
    }
    if (!section.granularityLevel && parentSection.granularityLevel) {
      section.setGranularityLevel(parentSection.granularityLevel);
    }

    parentSection.addSubSection(section);
    this.sections.push(section);
  }

  addSection(section: DataSectionDraft) {
    if (section.parentId && section.type === SectionType.REPEATABLE) {
      throw new ValueError(
        `Repeater section can only be added as root section`,
      );
    }
    this.sections.push(section);
  }

  publish(
    createdByUserId: string,
    visibility: VisibilityLevel,
  ): ProductDataModel {
    const lastPublished = this.publications.slice(-1);

    const versionToPublish =
      lastPublished.length > 0
        ? semver.inc(lastPublished[0].version, 'major')
        : '1.0.0';

    const published = ProductDataModel.loadFromDb({
      id: randomUUID(),
      name: this.name,
      version: versionToPublish,
      createdByUserId: createdByUserId,
      ownedByOrganizationId: this.ownedByOrganizationId,
      visibility,
      sections: this.sections.map((s) => s.publish()),
    });
    this.publications.push({ id: published.id, version: published.version });
    return published;
  }
}
