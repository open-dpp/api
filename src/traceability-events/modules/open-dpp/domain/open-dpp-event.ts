import { Expose } from 'class-transformer';
import { TraceabilityEventType } from '../../../domain/traceability-event-type.enum';
import { TraceabilityEvent } from '../../../domain/traceability-event';
import { OpenDppEventData } from './open-dpp-event-data';

export class OpenDppEvent extends TraceabilityEvent {
  readonly type: TraceabilityEventType = TraceabilityEventType.OPEN_DPP;

  @Expose()
  readonly data: OpenDppEventData;

  private constructor(data: OpenDppEventData) {
    super();
    this.data = data;
  }

  static create(data: { data: OpenDppEventData }) {
    return new OpenDppEvent(data.data);
  }
}
