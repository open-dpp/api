export class CreatePermalinkDto {
  productId: string;
  view: 'all' | 'manufacturer' | 'compliance' | 'client';
}
