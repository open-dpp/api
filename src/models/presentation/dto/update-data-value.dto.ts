import { IsNotEmpty, IsNotEmptyObject, IsUUID } from 'class-validator';

export class UpdateDataValueDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsNotEmptyObject()
  value: unknown;
}
