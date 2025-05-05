import { plainToInstance } from 'class-transformer';
import {
  DataFieldBase,
  DataFieldType,
} from '../../data-modelling/domain/data-field-base';
import { merge } from 'lodash';
import { Layout } from '../../data-modelling/domain/layout';

export class DataFieldDraft extends DataFieldBase {
  static create(plain: {
    name: string;
    type: DataFieldType;
    options?: Record<string, unknown>;
    layout: Layout;
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
    return this.toPlain();
  }
}
