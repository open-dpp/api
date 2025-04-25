import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateDataFieldRefDto } from './node.dto';

export class UpdateDataFieldDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsObject()
  @IsOptional()
  options?: Record<string, unknown>;
  @Type(() => UpdateDataFieldRefDto)
  @ValidateNested()
  readonly view: UpdateDataFieldRefDto;
}
