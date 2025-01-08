import { Permalink } from '../../permalinks/domain/permalink';

export class Product {
  constructor(
    public readonly id: string | undefined,
    public name: string,
    public description: string,
    public readonly permalinks: Permalink[] = [],
    public readonly createdAt?: Date,
  ) {}

  public createPermalink() {
    const permalink = new Permalink();
    permalink.linkTo(this.id);
    this.permalinks.push(permalink);
    return permalink;
  }
}
