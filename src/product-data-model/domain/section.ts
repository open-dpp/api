import { DataField, DataFieldValidationResult } from './data-field';
import { groupBy } from 'lodash';
import {
  DataSectionBase,
  SectionType,
} from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { DataValue } from '../../product-passport/domain/data-value';
import { Layout } from '../../data-modelling/domain/layout';
import { randomUUID } from 'crypto';
import { NotSupportedError } from '../../exceptions/domain.errors';

type DataSectionProps = {
  name: string;
  layout: Layout;
  granularityLevel?: GranularityLevel; // Required for repeater sections
};

type DataSectionDbProps = DataSectionProps & {
  id: string;
  parentId: string | undefined;
  subSections: string[];
  dataFields: DataField[];
};

export abstract class DataSection extends DataSectionBase {
  public constructor(
    public readonly id: string,
    protected _name: string,
    public readonly type: SectionType,
    public readonly layout: Layout,
    protected _subSections: string[],
    protected _parentId: string | undefined,
    public granularityLevel: GranularityLevel | undefined,
    public readonly dataFields: DataField[],
  ) {
    super(id, _name, type, layout, _subSections, _parentId, granularityLevel);
  }

  protected static createInstance<T extends DataSection>(
    Ctor: new (...args: any[]) => T,
    data: DataSectionProps,
    type: SectionType,
  ): T {
    return new Ctor(
      randomUUID(),
      data.name,
      type,
      data.layout,
      [],
      undefined,
      data.granularityLevel,
      [],
    );
  }

  // Add static factory method for loadFromDb
  protected static loadFromDbInstance<T extends DataSection>(
    Ctor: new (...args: any[]) => T,
    data: DataSectionDbProps,
    type: SectionType,
  ): T {
    return new Ctor(
      data.id,
      data.name,
      type,
      data.layout,
      data.subSections,
      data.parentId,
      data.granularityLevel,
      data.dataFields,
    );
  }

  abstract validate(
    version: string,
    values: DataValue[],
    granularity: GranularityLevel,
  ): DataFieldValidationResult[];
}

export class RepeaterSection extends DataSection {
  static create(data: DataSectionProps) {
    return DataSection.createInstance(
      RepeaterSection,
      data,
      SectionType.REPEATABLE,
    );
  }

  static loadFromDb(data: DataSectionDbProps) {
    return DataSection.loadFromDbInstance(
      RepeaterSection,
      data,
      SectionType.REPEATABLE,
    );
  }

  validate(
    version: string,
    values: DataValue[],
    granularity: GranularityLevel,
  ): DataFieldValidationResult[] {
    const validations = [];
    const sectionValues = groupBy(
      values.filter((v) => v.dataSectionId === this.id),
      'row',
    );
    for (const [row, dataValuesOfRow] of Object.entries(sectionValues)) {
      for (const dataField of this.dataFields.filter(
        (d) => d.granularityLevel === granularity,
      )) {
        const dataValue = dataValuesOfRow.find(
          (v) => v.dataFieldId === dataField.id,
        );
        validations.push(
          dataValue
            ? dataField.validate(version, dataValue.value)
            : DataFieldValidationResult.create({
                dataFieldId: dataField.id,
                dataFieldName: dataField.name,
                isValid: false,
                row: Number(row),
                errorMessage: `Value for data field is missing`,
              }),
        );
      }
    }
    return validations;
  }
}

export class GroupSection extends DataSection {
  static create(data: DataSectionProps) {
    return DataSection.createInstance(GroupSection, data, SectionType.GROUP);
  }

  static loadFromDb(data: DataSectionDbProps) {
    return DataSection.loadFromDbInstance(
      GroupSection,
      data,
      SectionType.GROUP,
    );
  }
  validate(
    version: string,
    values: DataValue[],
    granularity: GranularityLevel,
  ): DataFieldValidationResult[] {
    const validations = [];
    const sectionValues = values.filter((v) => v.dataSectionId === this.id);
    for (const dataField of this.dataFields.filter(
      (d) => d.granularityLevel === granularity,
    )) {
      const dataValue = sectionValues.find(
        (v) => v.dataFieldId === dataField.id,
      );
      validations.push(
        dataValue
          ? dataField.validate(version, dataValue.value)
          : DataFieldValidationResult.create({
              dataFieldId: dataField.id,
              dataFieldName: dataField.name,
              isValid: false,
              errorMessage: `Value for data field is missing`,
            }),
      );
    }
    return validations;
  }
}

const sectionSubTypes = [
  { value: RepeaterSection, name: SectionType.REPEATABLE },
  { value: GroupSection, name: SectionType.GROUP },
];

export function findSectionClassByTypeOrFail(type: SectionType) {
  const foundSectionType = sectionSubTypes.find((st) => st.name === type);
  if (!foundSectionType) {
    throw new NotSupportedError(`Section type ${type} is not supported`);
  }
  return foundSectionType.value;
}

export function isGroupSection(section: DataSection): section is GroupSection {
  return section.type === SectionType.GROUP;
}

export function isRepeaterSection(
  section: DataSection,
): section is RepeaterSection {
  return section.type === SectionType.REPEATABLE;
}
