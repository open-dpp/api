import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSectionDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
