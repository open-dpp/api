import { DrawflowNode } from './DrawflowNode';
import { Expose } from 'class-transformer';

export abstract class DrawflowHomeData {
  @Expose()
  data: Record<string, DrawflowNode>;
}
