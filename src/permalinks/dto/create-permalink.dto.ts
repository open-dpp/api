export class CreatePermalinkDto {
  referencedId: string;
  view: 'all' | 'manufacturer' | 'compliance' | 'client';
}
