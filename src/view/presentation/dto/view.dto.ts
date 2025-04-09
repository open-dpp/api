import { IsNotEmpty, IsString } from 'class-validator';

export class ViewDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
