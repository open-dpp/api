import { z } from 'zod';
import { Expose, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';

export enum DataFieldType {
  TEXT_FIELD = 'TextField',
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
  readonly type: DataFieldType;
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

export const dataFieldSubtypes = [
  { value: TextField, name: DataFieldType.TEXT_FIELD },
];
