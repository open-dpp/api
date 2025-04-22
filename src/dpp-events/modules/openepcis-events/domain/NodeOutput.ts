import { Expose } from 'class-transformer';
import { NodeConnection } from './NodeConnection';

export abstract class NodeOutput {
  @Expose()
  connections: NodeConnection[];
}
