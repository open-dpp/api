import { randomUUID } from 'crypto';
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { DataFieldDraft } from './data-field-draft';
import { DataSectionDraft } from './section-draft';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../../product-data-model/domain/product.data.model';
import { omit } from 'lodash';
import * as semver from 'semver';
import { LayoutProps } from '../../data-modelling/domain/layout';
import { SectionType } from '../../data-modelling/domain/section-base';

export type Publication = {
  id: string;
  version: string;
};

export class ProductDataModelDraft {
  @Expose()
  readonly id: string = randomUUID();
  @Expose({ name: 'name' })
  private _name: string;
  @Expose()
  readonly version: string;

  @Expose({ name: 'publications' })
  readonly _publications: Publication[] = [];

  @Expose({ name: 'ownedByOrganizationId' })
  private _ownedByOrganizationId: string | undefined;

  @Expose({ name: 'createdByUserId' })
  private _createdByUserId: string | undefined;

  @Type(() => DataSectionDraft)
  @Expose({ name: 'sections' })
  private _sections: DataSectionDraft[] = [];

  get sections() {
    return this._sections;
  }

  static create(plain: {
    name: string;
    userId: string;
    organizationId: string;
  }) {
    return ProductDataModelDraft.fromPlain({
      ...plain,
      version: '1.0.0',
      ownedByOrganizationId: plain.organizationId,
      createdByUserId: plain.userId,
    });
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

  static fromPlain(plain: unknown): ProductDataModelDraft {
    return plainToInstance(ProductDataModelDraft, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
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
      section.granularityLevel !== parentSection.granularityLevel
    ) {
      throw new ValueError(
        `Sub section ${section.id} has a granularity level of ${section.granularityLevel} which does not match the parent section's  granularity level of ${parentSection.granularityLevel}`,
      );
    }
    if (!section.granularityLevel && parentSection.granularityLevel) {
      section.granularityLevel = parentSection.granularityLevel;
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
    const plain = omit(this.toPlain(), [
      'id',
      'version',
      'sections',
      'createdByUserId',
    ]);

    const lastPublished = this.publications.slice(-1);

    const versionToPublish =
      lastPublished.length > 0
        ? semver.inc(lastPublished[0].version, 'major')
        : '1.0.0';

    const published = ProductDataModel.fromPlain({
      ...plain,
      version: versionToPublish,
      createdByUserId: createdByUserId,
      visibility,
      sections: this.sections.map((s) => s.publish()),
    });
    this.publications.push({ id: published.id, version: published.version });
    return published;
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
