import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { randomUUID } from 'crypto';
import { DataFieldDraft } from './data.field.draft';
import { SectionType } from '../../product-data-model/domain/section';
import { NotFoundError } from '../../exceptions/domain.errors';
import { omit } from 'lodash';

export class DataSectionDraft {
  @Expose()
  readonly id: string = randomUUID();
  @Expose({ name: 'name' })
  private _name: string;
  @Expose()
  readonly type: SectionType;
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

  get name() {
    return this._name;
  }

  rename(newName: string) {
    this._name = newName;
  }

  addDataField(dataField: DataFieldDraft) {
    this.dataFields.push(dataField);
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
    const plain = omit(this.toPlain(), ['id', 'dataFields']);
    return { ...plain, dataFields: this.dataFields.map((d) => d.publish()) };
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
