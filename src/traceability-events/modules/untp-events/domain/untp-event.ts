import { Expose } from 'class-transformer';
import { TraceabilityEventType } from '../../../domain/traceability-event-type.enum';
import { TraceabilityEvent } from '../../../domain/traceability-event';

export class UntpEvent extends TraceabilityEvent {
  readonly type: TraceabilityEventType = TraceabilityEventType.UNTP;

  @Expose()
  readonly data: any;

  private constructor(data: any) {
    super();
    this.data = data;
  }

  static create(data: any) {
    return new UntpEvent(data);
  }
}
