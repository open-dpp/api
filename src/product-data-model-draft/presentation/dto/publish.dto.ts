import { IsEnum } from 'class-validator';
import { VisibilityLevel } from '../../../product-data-model/domain/product.data.model';

export class PublishDto {
  @IsEnum(VisibilityLevel)
  readonly visibility: VisibilityLevel;
}
