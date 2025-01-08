import { randomUUID } from 'crypto';

export class Permalink {
  private referenceId?: string;
  constructor(
    public readonly uuid: string = randomUUID(),
    public readonly view:
      | 'all'
      | 'manufacturer'
      | 'compliance'
      | 'client' = 'all',
  ) {}
  public getReference() {
    return this.referenceId;
  }
  public linkTo(id: string) {
    this.referenceId = id;
  }
}
