import { Expose } from 'class-transformer';
import { TimeSelectorEnum } from './enums/TimeSelectorEnum';

export abstract class TimeInfo {
  @Expose()
  timeSelector: TimeSelectorEnum;

  @Expose()
  specificTime?: string;

  @Expose()
  fromTime?: string;

  @Expose()
  toTime?: string;

  @Expose()
  timeZoneOffset?: string;
}
