import { randomUUID } from 'crypto';
import { z } from 'zod';
import { DataValue } from '../../models/domain/model';

export enum DataType {
  TEXT_FIELD = 'TextField',
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
  abstract validate(version: string, value: unknown): DataFieldValidationResult;
  protected constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: DataType,
    public readonly options: Record<string, unknown> = {},
  ) {}
}

export class TextField extends DataField {
  constructor(
    id: string = randomUUID(),
    name: string,
    options?: Record<string, unknown>,
  ) {
    super(id, name, DataType.TEXT_FIELD, options);
  }

  validate(version: string, value: unknown): DataFieldValidationResult {
    const result = z.string().safeParse(value);
    return new DataFieldValidationResult(
      this.id,
      this.name,
      result.success,
      !result.success ? result.error.issues[0].message : undefined,
    );
  }
}

export function makeDataField(
  id: string,
  type: DataType,
  name: string,
  options: Record<string, unknown>,
) {
  switch (type) {
    case DataType.TEXT_FIELD:
      return new TextField(id, name, options);
    default:
      throw new Error(`Unknown data field type: ${type}`);
  }
}

export class DataSection {
  constructor(
    public readonly id: string = randomUUID(),
    public readonly dataFields: DataField[],
  ) {}
}

export class ProductDataModel {
  constructor(
    public readonly id: string = randomUUID(),
    public readonly name: string,
    public readonly version: string,
    public readonly sections: DataSection[] = [],
  ) {}
  static fromPlain(plain: unknown): ProductDataModel {
    const parsed = z
      .object({
        name: z.string(),
        version: z.string(),
        sections: z
          .object({
            dataFields: z
              .object({
                type: z.nativeEnum(DataType),
                name: z.string(),
                options: z.record(z.string(), z.unknown()),
              })
              .array(),
          })
          .array(),
      })
      .parse(plain);
    return new ProductDataModel(
      undefined,
      parsed.name,
      parsed.version,
      parsed.sections.map(
        (s) =>
          new DataSection(
            undefined,
            s.dataFields.map((f) =>
              makeDataField(undefined, f.type, f.name, f.options),
            ),
          ),
      ),
    );
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
        s.dataFields.map(
          (f) => new DataValue(undefined, undefined, s.id, f.id),
        ),
      )
      .flat();
  }
}
