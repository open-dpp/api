import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SectionType } from '../../../data-modelling/domain/section-base';
import { Type } from 'class-transformer';
import { SectionLayout } from './layout.dto';

export class CreateSectionDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsEnum(SectionType)
  readonly type: SectionType;
  @IsString()
  @IsOptional()
  readonly parentSectionId?: string;
  @Type(() => SectionLayout)
  @ValidateNested()
  readonly layout: SectionLayout;
}
