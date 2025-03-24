import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { DataFieldType } from '../../product-data-model/domain/data.field';
import { merge, omit } from 'lodash';

export class DataFieldDraft {
  @Expose()
  readonly id: string = randomUUID();
  @Expose({ name: 'name' })
  private _name: string;
  @Expose()
  readonly type: DataFieldType;
  @Expose()
  readonly options: Record<string, unknown> = {};

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

  get name() {
    return this._name;
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

  toPlain() {
    return instanceToPlain(this);
  }
}
