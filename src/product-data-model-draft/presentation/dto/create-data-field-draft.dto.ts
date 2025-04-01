import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DataFieldType } from '../../../data-modelling/domain/data-field-base';

export class CreateDataFieldDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsEnum(DataFieldType)
  readonly type: DataFieldType;
  @IsObject()
  @IsOptional()
  readonly options?: Record<string, unknown>;
}
