import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSectionGridDto } from './node.dto';

export class UpdateSectionDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @Type(() => UpdateSectionGridDto)
  @ValidateNested()
  readonly view: UpdateSectionGridDto;
}
