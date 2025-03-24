import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateDataFieldDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsObject()
  @IsOptional()
  options?: Record<string, unknown>;
}
