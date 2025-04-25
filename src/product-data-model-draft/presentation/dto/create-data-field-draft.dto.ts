import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DataFieldType } from '../../../data-modelling/domain/data-field-base';
import { Type } from 'class-transformer';
import { CreateDataFieldRefDto } from './node.dto';

export class CreateDataFieldDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsEnum(DataFieldType)
  readonly type: DataFieldType;
  @IsObject()
  @IsOptional()
  readonly options?: Record<string, unknown>;
  @Type(() => CreateDataFieldRefDto)
  @ValidateNested()
  readonly view: CreateDataFieldRefDto;
}
