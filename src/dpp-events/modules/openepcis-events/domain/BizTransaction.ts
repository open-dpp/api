import { Expose } from 'class-transformer';
import { randomUUID } from 'crypto';

export abstract class BizTransaction {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly type: string;

  @Expose()
  readonly bizTransaction: string;
}
