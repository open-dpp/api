import { Expose } from 'class-transformer';
import { EventNode } from './EventNode';
import { IdentifiersNode } from './IdentifiersNode';
import { Connector } from './Connector';
import { DrawflowInfo } from './DrawflowInfo';

export abstract class RootModel {
  @Expose()
  eventNodeInfo: EventNode[];

  @Expose()
  identifiersNodeInfo: IdentifiersNode[];

  @Expose()
  connectorsInfo: Connector[];

  @Expose()
  drawflowInfo: DrawflowInfo;
}
