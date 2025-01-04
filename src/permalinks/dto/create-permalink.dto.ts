import { Product } from '../../products/entities/product.entity';

export class CreatePermalinkDto {
  product: Product;
  view: 'all' | 'manufacturer' | 'compliance' | 'client';
}
