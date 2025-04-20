import { Expose } from 'class-transformer';

export abstract class NodeConnection {
  @Expose()
  node: string;

  @Expose()
  output: string;
}
