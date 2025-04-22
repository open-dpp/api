import { Expose } from 'class-transformer';
import { randomUUID } from 'crypto';

export abstract class Connector {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly name: string;

  @Expose()
  readonly source: string;

  @Expose()
  readonly target: string;

  @Expose()
  readonly hideInheritParentCount: boolean;

  @Expose()
  readonly epcCount: number;

  @Expose()
  readonly inheritParentCount: number;

  @Expose()
  readonly classCount: number;

  @Expose()
  readonly quantity: number;
}
