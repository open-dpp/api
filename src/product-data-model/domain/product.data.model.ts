import { randomUUID } from 'crypto';
import { z } from 'zod';
import { DataValue } from '../../models/domain/model';
import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer';

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
  constructor(
    public readonly dataFieldId: string,
    public readonly dataFieldName: string,
    public readonly isValid: boolean,
    public readonly errorMessage?: string,
  ) {}

  toJson() {
    return {
      id: this.dataFieldId,
      name: this.dataFieldName,
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
    return new DataFieldValidationResult(
      this.id,
      this.name,
      result.success,
      !result.success ? result.error.issues[0].message : undefined,
    );
  }
}

export class DataSection {
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
}

export class ProductDataModel {
  @Expose()
  readonly id: string = randomUUID();
  @Expose()
  readonly name: string;
  @Expose()
  readonly version: string;
  @Expose()
  @Type(() => DataSection)
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
      for (const dataField of section.dataFields) {
        const dataValue = values.find((v) => v.dataFieldId === dataField.id);
        validationOutput.addValidationResult(
          dataValue
            ? dataField.validate(this.version, dataValue.value)
            : new DataFieldValidationResult(
                dataField.id,
                dataField.name,
                false,
                `Value for data field is missing`,
              ),
        );
      }
    }
    return validationOutput;
  }
  public createInitialDataValues(): DataValue[] {
    return this.sections
      .map((s) =>
        s.dataFields.map((f) =>
          DataValue.fromPlain({ dataSectionId: s.id, dataFieldId: f.id }),
        ),
      )
      .flat();
  }
}
