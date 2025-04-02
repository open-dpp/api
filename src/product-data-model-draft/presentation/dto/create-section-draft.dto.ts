import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SectionType } from '../../../data-modelling/domain/section-base';

export class CreateSectionDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsEnum(SectionType)
  readonly type: SectionType;
  @IsString()
  @IsOptional()
  readonly parentSectionId?: string;
}
