import { plainToInstance } from 'class-transformer';
import {
  DataFieldBase,
  DataFieldType,
} from '../../data-modelling/domain/data-field-base';
import { merge, omit } from 'lodash';

export class DataFieldDraft extends DataFieldBase {
  static create(plain: {
    name: string;
    type: DataFieldType;
    options?: Record<string, unknown>;
  }): DataFieldDraft {
    return plainToInstance(DataFieldDraft, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
  mergeOptions(newOptions: Record<string, unknown>) {
    merge(this.options, newOptions);
  }

  rename(newName: string) {
    this._name = newName;
  }

  publish() {
    return omit(this.toPlain(), 'id');
  }
}
