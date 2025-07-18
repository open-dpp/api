import { TraceabilityEventType } from '../../../domain/traceability-event-type.enum';
import { OpenDppEventData } from './open-dpp-event-data';
import { TraceabilityEvent } from '../../../domain/traceability-event';
import { TraceabilityEventWrapper } from '../../../domain/traceability-event-wrapper';

export class OpenDppEvent extends TraceabilityEvent {
  private constructor(public readonly data: OpenDppEventData) {
    super(TraceabilityEventType.OPEN_DPP);
    this.data = data;
  }

  static createWithWrapper(data: {
    userId: string;
    itemId: string;
    organizationId: string;
    childData: OpenDppEventData;
    ip?: string | null | undefined;
    chargeId?: string | null | undefined;
    geolocation?:
      | {
          latitude: string;
          longitude: string;
        }
      | null
      | undefined;
  }): TraceabilityEventWrapper<OpenDppEvent> {
    return TraceabilityEventWrapper.create({
      type: TraceabilityEventType.OPEN_DPP,
      ip: data.ip,
      userId: data.userId,
      itemId: data.itemId,
      organizationId: data.organizationId,
      chargeId: data.chargeId,
      geolocation: data.geolocation,
      data: new OpenDppEvent(data.childData),
    });
  }
}
