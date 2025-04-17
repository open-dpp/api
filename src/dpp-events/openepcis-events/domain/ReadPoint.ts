import { Expose } from 'class-transformer';
import { ReadPointTypeEnum } from './enums/ReadPointTypeEnum';

export abstract class ReadPoint {
  @Expose()
  type: ReadPointTypeEnum;

  @Expose()
  gln: string;

  @Expose()
  extension?: number;
}
