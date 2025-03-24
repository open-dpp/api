import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductDataModelDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
