import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDataModelDraftDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
