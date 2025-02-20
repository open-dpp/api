import { randomUUID } from 'crypto';
import { z } from 'zod';
import { DataValue } from '../../models/domain/model';
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';
import { groupBy } from 'lodash';

export enum DataType {
  TEXT_FIELD = 'TextField',
}

export enum SectionType {
  GROUP = 'Group',
  REPEATABLE = 'Repeatable',
}

export class ValidationResult {
  private readonly _validationResults: DataFieldValidationResult[] = [];
  private _isValid: boolean = true;

  public get isValid() {
    return this._isValid;
  }
  public get validationResults() {
    return this._validationResults;
  }

  public addValidationResult(validationResult: DataFieldValidationResult) {
    if (!validationResult.isValid) {
      this._isValid = false;
    }
    this._validationResults.push(validationResult);
  }
  public toJson() {
    return {
      isValid: this.isValid,
      errors: this.validationResults
        .filter((v) => !v.isValid)
        .map((v) => v.toJson()),
    };
  }
}

export class DataFieldValidationResult {
  @Expose()
  readonly dataFieldId: string;
  @Expose()
  readonly dataFieldName: string;
  @Expose()
  readonly isValid: boolean;
  @Expose()
  readonly row?: number;
  @Expose()
  readonly errorMessage?: string;
  static fromPlain(
    plain: Partial<DataFieldValidationResult>,
  ): DataFieldValidationResult {
    return plainToInstance(DataFieldValidationResult, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toJson() {
    return {
      id: this.dataFieldId,
      name: this.dataFieldName,
      ...(this.row ? { row: this.row } : {}),
      message: this.errorMessage,
    };
  }
}

export abstract class DataField {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly name: string;
  @Expose()
  readonly type: DataType;
  @Expose()
  readonly options: Record<string, unknown> = {};
  abstract validate(version: string, value: unknown): DataFieldValidationResult;
}

export class TextField extends DataField {
  validate(version: string, value: unknown): DataFieldValidationResult {
    const result = z.ostring().safeParse(value);
    return DataFieldValidationResult.fromPlain({
      dataFieldId: this.id,
      dataFieldName: this.name,
      isValid: result.success,
      errorMessage: !result.success
        ? result.error.issues[0].message
        : undefined,
    });
  }
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
      subTypes: [{ value: TextField, name: DataType.TEXT_FIELD }],
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

export class ProductDataModel {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly name: string;
  @Expose()
  readonly version: string;
  @Expose()
  @Type(() => DataSection, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: RepeaterSection, name: SectionType.REPEATABLE },
        { value: GroupSection, name: SectionType.GROUP },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  readonly sections: DataSection[] = [];

  // TODO: Partial seems not to work with data field id not set. Even type-fest deep partial is not enough
  static fromPlain(plain: unknown): ProductDataModel {
    return plainToInstance(ProductDataModel, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }
  toPlain() {
    return instanceToPlain(this);
  }
  validate(
    values: DataValue[],
    includeSectionIds: string[] = [],
  ): ValidationResult {
    const validationOutput = new ValidationResult();
    const sectionsToValidate =
      includeSectionIds.length === 0
        ? this.sections
        : this.sections.filter((s) => includeSectionIds.includes(s.id));
    for (const section of sectionsToValidate) {
      section
        .validate(this.version, values)
        .map((v) => validationOutput.addValidationResult(v));
    }
    return validationOutput;
  }
  public createInitialDataValues(): DataValue[] {
    return this.sections
      .filter((s) => s.type === SectionType.GROUP)
      .map((s) =>
        s.dataFields.map((f) =>
          DataValue.fromPlain({ dataSectionId: s.id, dataFieldId: f.id }),
        ),
      )
      .flat();
  }
}
