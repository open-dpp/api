import {
  DataFieldBase,
  DataFieldType,
} from '../../data-modelling/domain/data-field-base';
import { merge } from 'lodash';
import { Layout, LayoutProps } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { randomUUID } from 'crypto';
import { DataFieldDbProps } from '../../templates/domain/data-field';

export type DataFieldDraftCreateProps = {
  name: string;
  type: DataFieldType;
  options?: Record<string, unknown>;
  layout: LayoutProps;
  granularityLevel: GranularityLevel;
};

export type DataFieldDraftDbProps = DataFieldDraftCreateProps & {
  id: string;
};

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
  static create(data: DataFieldDraftCreateProps): DataFieldDraft {
    return new DataFieldDraft(
      randomUUID(),
      data.name,
      data.type,
      data.options,
      Layout.create(data.layout),
      data.granularityLevel,
    );
  }

  static loadFromDb(data: DataFieldDraftDbProps) {
    return new DataFieldDraft(
      data.id,
      data.name,
      data.type,
      data.options,
      Layout.create(data.layout),
      data.granularityLevel,
    );
  }

  mergeOptions(newOptions: Record<string, unknown>) {
    merge(this.options, newOptions);
  }

  rename(newName: string) {
    this._name = newName;
  }

  publish(): DataFieldDbProps {
    return {
      type: this.type,
      id: this.id,
      layout: this.layout,
      granularityLevel: this.granularityLevel,
      options: this.options,
      name: this.name,
    };
  }
}
