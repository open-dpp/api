import { Expose } from 'class-transformer';
import { randomUUID } from 'crypto';
import { NodeData } from './NodeData';
import { NodeOutput } from './NodeOutput';

export abstract class DrawflowNode {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly name: string;

  @Expose()
  readonly data: NodeData;

  @Expose()
  readonly class: string;

  @Expose()
  readonly html: string;

  @Expose()
  readonly typenode: string;

  @Expose()
  readonly inputs: Record<string, any>;

  @Expose()
  readonly outputs: Record<string, NodeOutput>;

  @Expose()
  readonly pos_x: number;
  // There may be other properties like pos_y that aren't shown in the truncated JSON
}
