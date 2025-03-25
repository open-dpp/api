import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DataFieldType } from '../../../product-data-model/domain/data.field';

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
