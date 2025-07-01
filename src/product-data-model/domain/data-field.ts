import { z } from 'zod/v4';
import {
  DataFieldBase,
  DataFieldType,
} from '../../data-modelling/domain/data-field-base';
import { Layout } from '../../data-modelling/domain/layout';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import { randomUUID } from 'crypto';
import { NotSupportedError } from '../../exceptions/domain.errors';

export class DataFieldValidationResult {
  private constructor(
    public readonly dataFieldId: string,
    public readonly dataFieldName: string,
    public readonly isValid: boolean,
    public readonly row?: number,
    public readonly errorMessage?: string,
  ) {}

  static create(data: {
    dataFieldId: string;
    dataFieldName: string;
    isValid: boolean;
    row?: number;
    errorMessage?: string;
  }): DataFieldValidationResult {
    return new DataFieldValidationResult(
      data.dataFieldId,
      data.dataFieldName,
      data.isValid,
      data.row,
      data.errorMessage,
    );
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

type DataFieldProps = {
  name: string;
  options?: Record<string, unknown>;
  layout: Layout;
  granularityLevel: GranularityLevel;
};

type DataFieldDbProps = DataFieldProps & {
  id: string;
};

export abstract class DataField extends DataFieldBase {
  protected static createInstance<T extends DataFieldBase>(
    Ctor: new (...args: any[]) => T,
    data: DataFieldProps,
    type: DataFieldType,
  ): T {
    return new Ctor(
      randomUUID(),
      data.name,
      type,
      data.options ?? {},
      data.layout,
      data.granularityLevel,
    );
  }

  // Add static factory method for loadFromDb
  protected static loadFromDbInstance<T extends DataFieldBase>(
    Ctor: new (...args: any[]) => T,
    data: DataFieldDbProps,
    type: DataFieldType,
  ): T {
    return new Ctor(
      data.id,
      data.name,
      type,
      data.options,
      data.layout,
      data.granularityLevel,
    );
  }

  abstract validate(version: string, value: unknown): DataFieldValidationResult;
}

function validateString(
  id: string,
  name: string,
  value: unknown,
): DataFieldValidationResult {
  const result = z.string().optional().safeParse(value);
  return DataFieldValidationResult.create({
    dataFieldId: id,
    dataFieldName: name,
    isValid: result.success,
    errorMessage: !result.success ? result.error.issues[0].message : undefined,
  });
}

export class TextField extends DataField {
  static create(data: DataFieldProps) {
    return DataField.createInstance(TextField, data, DataFieldType.TEXT_FIELD);
  }

  static loadFromDb(data: DataFieldDbProps) {
    return DataField.loadFromDbInstance(
      TextField,
      data,
      DataFieldType.TEXT_FIELD,
    );
  }
  validate(version: string, value: unknown): DataFieldValidationResult {
    return validateString(this.id, this.name, value);
  }
}

export class ProductPassportLink extends DataField {
  static create(data: DataFieldProps) {
    return DataField.createInstance(
      ProductPassportLink,
      data,
      DataFieldType.PRODUCT_PASSPORT_LINK,
    );
  }

  static loadFromDb(data: DataFieldDbProps) {
    return DataField.loadFromDbInstance(
      ProductPassportLink,
      data,
      DataFieldType.PRODUCT_PASSPORT_LINK,
    );
  }
  validate(version: string, value: unknown): DataFieldValidationResult {
    return validateString(this.id, this.name, value);
  }
}

export class NumericField extends DataField {
  static create(data: DataFieldProps) {
    return DataField.createInstance(
      NumericField,
      data,
      DataFieldType.NUMERIC_FIELD,
    );
  }

  static loadFromDb(data: DataFieldDbProps) {
    return DataField.loadFromDbInstance(
      NumericField,
      data,
      DataFieldType.NUMERIC_FIELD,
    );
  }
  validate(version: string, value: unknown): DataFieldValidationResult {
    const result = z.number().optional().safeParse(value);
    return DataFieldValidationResult.create({
      dataFieldId: this.id,
      dataFieldName: this.name,
      isValid: result.success,
      errorMessage: !result.success
        ? result.error.issues[0].message
        : undefined,
    });
  }
}

const dataFieldSubtypes = [
  { value: TextField, name: DataFieldType.TEXT_FIELD },
  { value: ProductPassportLink, name: DataFieldType.PRODUCT_PASSPORT_LINK },
  { value: NumericField, name: DataFieldType.NUMERIC_FIELD },
];

export function findDataFieldClassByTypeOrFail(type: DataFieldType) {
  const foundDataFieldType = dataFieldSubtypes.find((st) => st.name === type);
  if (!foundDataFieldType) {
    throw new NotSupportedError(`Data field type ${type} is not supported`);
  }
  return foundDataFieldType.value;
}
