import { plainToInstance } from 'class-transformer';
import {
  DataFieldBase,
  DataFieldType,
} from '../../data-modelling/domain/data-field-base';
import { merge } from 'lodash';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export class DataFieldDraft extends DataFieldBase {
  static create(plain: {
    name: string;
    type: DataFieldType;
    options?: Record<string, unknown>;
    layout: Layout;
    granularityLevel: GranularityLevel;
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
