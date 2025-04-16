import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ViewDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsUUID()
  readonly dataModelId: string;
}
