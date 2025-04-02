import { randomUUID } from 'crypto';
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { DataFieldDraft } from './data-field-draft';
import { DataSectionDraft } from './section-draft';
import { NotFoundError } from '../../exceptions/domain.errors';
import { User } from '../../users/domain/user';
import { Organization } from '../../organizations/domain/organization';
import {
  ProductDataModel,
  VisibilityLevel,
} from '../../product-data-model/domain/product.data.model';
import { omit } from 'lodash';
import * as semver from 'semver';
import { DraftToPublishIdMapping } from './draft-to-publish-id-mapping';

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
    user: User;
    organization: Organization;
  }) {
    return ProductDataModelDraft.fromPlain({
      ...plain,
      version: '1.0.0',
      ownedByOrganizationId: plain.organization.id,
      createdByUserId: plain.user.id,
    });
  }

  public isOwnedBy(organization: Organization) {
    return this._ownedByOrganizationId === organization.id;
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
    const found = this.findSectionOrFail(sectionId);
    for (const sectionId of found.subSections) {
      this.deleteSection(sectionId);
    }
    this._sections = this.sections.filter((s) => s.id !== found.id);
  }

  modifySection(sectionId: string, data: { name?: string }) {
    if (data.name) {
      this.findSectionOrFail(sectionId).rename(data.name);
    }
  }

  modifyDataField(
    sectionId: string,
    dataFieldId: string,
    data: { name?: string; options?: Record<string, unknown> },
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
    const foundSection = this.sections.find((s) => s.id === sectionId);
    if (!foundSection) {
      throw new NotFoundError(DataSectionDraft.name, sectionId);
    }
    return foundSection;
  }

  addSubSection(parentSectionId: string, section: DataSectionDraft) {
    const parentSection = this.findSectionOrFail(parentSectionId);
    parentSection.addSubSection(section);
    this.sections.push(section);
  }

  addSection(section: DataSectionDraft) {
    this.sections.push(section);
  }

  publish(createdByUser: User, visibility: VisibilityLevel): ProductDataModel {
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
    const idMapper = new DraftToPublishIdMapping(this.sections);

    const published = ProductDataModel.fromPlain({
      ...plain,
      version: versionToPublish,
      createdByUserId: createdByUser.id,
      visibility,
      sections: this.sections.map((s) => s.publish(idMapper)),
    });
    this.publications.push({ id: published.id, version: published.version });
    return published;
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
