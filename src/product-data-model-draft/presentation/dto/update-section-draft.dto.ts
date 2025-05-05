import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SectionLayout } from './layout.dto';

export class UpdateSectionDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @Type(() => SectionLayout)
  @ValidateNested()
  readonly layout: SectionLayout;
}
