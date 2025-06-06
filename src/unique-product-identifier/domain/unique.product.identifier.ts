import { randomUUID } from 'crypto';
import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';

export class UniqueProductIdentifier {
  @Expose({ name: 'referenceId' })
  private _referenceId?: string;

  @Expose()
  readonly uuid: string = randomUUID();

  public get referenceId() {
    return this._referenceId;
  }

  public linkTo(id: string) {
    this._referenceId = id;
  }

  static fromPlain(plain: Partial<UniqueProductIdentifier>) {
    return plainToInstance(UniqueProductIdentifier, plain, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  public toPlain() {
    return instanceToPlain(this);
  }
}
