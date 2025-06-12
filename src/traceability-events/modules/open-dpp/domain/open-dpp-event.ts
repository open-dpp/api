import { Expose } from 'class-transformer';
import { TraceabilityEventType } from '../../../domain/traceability-event-type.enum';
import { OpenDppEventData } from './open-dpp-event-data';
import { TraceabilityEvent } from '../../../domain/traceability-event';
import { TraceabilityEventWrapper } from '../../../domain/traceability-event-wrapper';

export class OpenDppEvent extends TraceabilityEvent {
  @Expose()
  readonly data: OpenDppEventData;

  private constructor(data: OpenDppEventData) {
    super(TraceabilityEventType.OPEN_DPP);
    this.data = data;
  }

  static create(data: {
    userId: string;
    articleId: string;
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
      articleId: data.articleId,
      organizationId: data.organizationId,
      chargeId: data.chargeId,
      geolocation: data.geolocation,
      data: new OpenDppEvent(data.childData),
    });
  }
}
