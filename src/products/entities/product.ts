export class Product {
  constructor(
    public id: string,
    public name: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
    public description: string,
    public permalinks: { uuid: string }[],
  ) {}
}
