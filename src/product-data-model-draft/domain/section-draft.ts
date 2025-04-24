import { Expose, plainToInstance, Type } from 'class-transformer';
import { DataFieldDraft } from './data-field-draft';
import {
  DataSectionBase,
  SectionType,
} from '../../data-modelling/domain/section-base';
import { NotFoundError } from '../../exceptions/domain.errors';
import { omit } from 'lodash';

export class DataSectionDraft extends DataSectionBase {
  @Expose()
  @Type(() => DataFieldDraft)
  readonly dataFields: DataFieldDraft[];

  static create(plain: { name: string; type: SectionType }) {
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

  modifyDataField(
    dataFieldId: string,
    data: { name?: string; options?: Record<string, unknown> },
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
