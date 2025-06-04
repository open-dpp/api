import { Expose, plainToInstance, Type } from 'class-transformer';
import { DataFieldDraft } from './data-field-draft';
import {
  DataSectionBase,
  SectionType,
} from '../../data-modelling/domain/section-base';
import { NotFoundError, ValueError } from '../../exceptions/domain.errors';
import { omit } from 'lodash';
import { Layout, LayoutProps } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export class DataSectionDraft extends DataSectionBase {
  @Expose()
  @Type(() => DataFieldDraft)
  readonly dataFields: DataFieldDraft[];

  static create(plain: {
    name: string;
    type: SectionType;
    layout: Layout;
    granularityLevel?: GranularityLevel;
  }) {
    if (plain.type === SectionType.REPEATABLE && !plain.granularityLevel) {
      throw new ValueError(`Repeatable must have a granularity level`);
    }
    return plainToInstance(
      DataSectionDraft,
      { ...plain, dataFields: [] },
      {
        excludeExtraneousValues: true,
        exposeDefaultValues: true,
      },
    );
  }

  assignParent(parent: DataSectionDraft) {
    this._parentId = parent.id;
  }

  removeParent() {
    this._parentId = undefined;
  }

  rename(newName: string) {
    this._name = newName;
  }

  addDataField(dataField: DataFieldDraft) {
    this.dataFields.push(dataField);
  }

  addSubSection(section: DataSectionDraft) {
    this._subSections.push(section.id);
    section.assignParent(this);
  }

  deleteSubSection(subSection: DataSectionDraft) {
    if (!this.subSections.find((id) => id === subSection.id)) {
      throw new ValueError(
        `Could not found and delete sub section ${subSection.id} from ${this.id}`,
      );
    }
    this._subSections = this.subSections.filter((n) => n !== subSection.id);
    subSection.removeParent();
    return subSection;
  }

  modifyDataField(
    dataFieldId: string,
    data: {
      name?: string;
      options?: Record<string, unknown>;
      layout: Partial<LayoutProps>;
    },
  ) {
    const found = this.dataFields.find((d) => d.id === dataFieldId);
    if (!found) {
      throw new NotFoundError(DataFieldDraft.name, dataFieldId);
    }
    if (data.name) {
      found.rename(data.name);
    }
    if (data.options) {
      found.mergeOptions(data.options);
    }
    if (data.layout) {
      found.layout.modify(data.layout);
    }
  }

  deleteDataField(dataFieldId: string) {
    const foundIndex = this.dataFields.findIndex((d) => d.id === dataFieldId);
    if (foundIndex < 0) {
      throw new NotFoundError(DataFieldDraft.name, dataFieldId);
    }
    this.dataFields.splice(foundIndex, 1);
  }

  publish() {
    const plain = omit(this.toPlain(), ['dataFields']);
    return {
      ...plain,
      dataFields: this.dataFields.map((d) => d.publish()),
    };
  }
}
