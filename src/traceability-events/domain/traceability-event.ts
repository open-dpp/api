import { TraceabilityEventType } from './traceability-event-type.enum';
import { Expose } from 'class-transformer';

export abstract class TraceabilityEvent {
  @Expose()
  type: TraceabilityEventType;
}
