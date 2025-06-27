import {
  DataFieldBase,
  DataFieldType,
} from '../../data-modelling/domain/data-field-base';
import { merge } from 'lodash';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { randomUUID } from 'crypto';
import {
  DataField,
  findDataFieldClassByTypeOrFail,
} from '../../product-data-model/domain/data-field';

export class DataFieldDraft extends DataFieldBase {
  private constructor(
    public readonly id: string,
    protected _name: string,
    public readonly type: DataFieldType,
    public readonly options: Record<string, unknown> = {},
    public readonly layout: Layout,
    public readonly granularityLevel: GranularityLevel,
  ) {
    super(id, _name, type, options, layout, granularityLevel);
  }
  static create(data: {
    name: string;
    type: DataFieldType;
    options?: Record<string, unknown>;
    layout: Layout;
    granularityLevel: GranularityLevel;
  }): DataFieldDraft {
    return new DataFieldDraft(
      randomUUID(),
      data.name,
      data.type,
      data.options,
      data.layout,
      data.granularityLevel,
    );
  }

  static loadFromDb(data: {
    id: string;
    name: string;
    type: DataFieldType;
    options: Record<string, unknown> | undefined;
    layout: Layout;
    granularityLevel: GranularityLevel;
  }) {
    return new DataFieldDraft(
      data.id,
      data.name,
      data.type,
      data.options,
      data.layout,
      data.granularityLevel,
    );
  }

  mergeOptions(newOptions: Record<string, unknown>) {
    merge(this.options, newOptions);
  }

  rename(newName: string) {
    this._name = newName;
  }

  publish(): DataField {
    const DataFieldClass = findDataFieldClassByTypeOrFail(this.type);
    return DataFieldClass.loadFromDb({
      id: this.id,
      layout: this.layout,
      granularityLevel: this.granularityLevel,
      options: this.options,
      name: this.name,
    });
  }
}
