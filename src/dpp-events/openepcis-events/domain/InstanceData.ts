import { Expose } from 'class-transformer';
import { SerialTypeEnum } from './enums/SerialTypeEnum';
import { IdentifierTypeEnum } from './enums/IdentifierTypeEnum';

export abstract class InstanceData {
  @Expose()
  identifierType: IdentifierTypeEnum;

  @Expose()
  serialType: SerialTypeEnum;

  @Expose()
  gcp: string;

  @Expose()
  serialNumber: string;

  @Expose()
  rangeFrom: number;
}
