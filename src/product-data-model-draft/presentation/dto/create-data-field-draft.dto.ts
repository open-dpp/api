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
import { LayoutDto } from './layout.dto';

export class CreateDataFieldDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsEnum(DataFieldType)
  readonly type: DataFieldType;
  @IsObject()
  @IsOptional()
  readonly options?: Record<string, unknown>;
  @Type(() => LayoutDto)
  @ValidateNested()
  readonly layout: LayoutDto;
}
