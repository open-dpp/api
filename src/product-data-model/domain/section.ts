import { Expose, Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import {
  DataField,
  dataFieldSubtypes,
  DataFieldValidationResult,
} from './data.field';
import { DataValue } from '../../models/domain/model';
import { groupBy } from 'lodash';

export enum SectionType {
  GROUP = 'Group',
  REPEATABLE = 'Repeatable',
}

export abstract class DataSection {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly name: string;
  @Expose()
  readonly type: SectionType;
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
  ): DataFieldValidationResult[];
}

export class RepeaterSection extends DataSection {
  validate(version: string, values: DataValue[]): DataFieldValidationResult[] {
    const validations = [];
    const sectionValues = groupBy(
      values.filter((v) => v.dataSectionId === this.id),
      'row',
    );
    for (const [row, dataValuesOfRow] of Object.entries(sectionValues)) {
      for (const dataField of this.dataFields) {
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
  validate(version: string, values: DataValue[]): DataFieldValidationResult[] {
    const validations = [];
    const sectionValues = values.filter((v) => v.dataSectionId === this.id);
    for (const dataField of this.dataFields) {
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
