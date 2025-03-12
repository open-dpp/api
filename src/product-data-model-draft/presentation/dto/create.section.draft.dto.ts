import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SectionType } from '../../../product-data-model/domain/section';

export class CreateSectionDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsEnum(SectionType)
  readonly type: SectionType;
}
