import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LayoutDto } from './layout.dto';

export class UpdateDataFieldDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsObject()
  @IsOptional()
  options?: Record<string, unknown>;
  @Type(() => LayoutDto)
  @ValidateNested()
  readonly layout: LayoutDto;
}
