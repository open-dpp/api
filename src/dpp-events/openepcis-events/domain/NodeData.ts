import { Expose } from 'class-transformer';

export abstract class NodeData {
  @Expose()
  ID: number;

  @Expose()
  eventType: string;
}
