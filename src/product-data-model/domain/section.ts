import {
  DataField,
  dataFieldSubtypes,
  DataFieldValidationResult,
} from './data-field';
import { groupBy } from 'lodash';
import { Expose, Type } from 'class-transformer';
import {
  DataSectionBase,
  SectionType,
} from '../../data-modelling/domain/section-base';
import { DataValue } from '../../passport/domain/passport';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';

export abstract class DataSection extends DataSectionBase {
  @Expose()
  @Type(() => DataField, {
    discriminator: {
      property: 'type',
      subTypes: dataFieldSubtypes,
    },
    keepDiscriminatorProperty: true,
  })
  readonly dataFields: DataField[];

  abstract validate(
    version: string,
    values: DataValue[],
    granularity: GranularityLevel,
  ): DataFieldValidationResult[];
}

export class RepeaterSection extends DataSection {
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
            : DataFieldValidationResult.fromPlain({
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
          : DataFieldValidationResult.fromPlain({
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

export const sectionSubTypes = [
  { value: RepeaterSection, name: SectionType.REPEATABLE },
  { value: GroupSection, name: SectionType.GROUP },
];

export function isGroupSection(section: DataSection): section is GroupSection {
  return section.type === SectionType.GROUP;
}

export function isRepeaterSection(
  section: DataSection,
): section is RepeaterSection {
  return section.type === SectionType.REPEATABLE;
}
