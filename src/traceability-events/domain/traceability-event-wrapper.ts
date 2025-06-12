import { randomUUID } from 'crypto';
import { TraceabilityEvent } from './traceability-event';
import { TraceabilityEventType } from './traceability-event-type.enum';

export class TraceabilityEventWrapper<T extends TraceabilityEvent> {
  private constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly ip: string | null,
    public readonly userId: string | null,
    public readonly itemId: string | null,
    public readonly chargeId: string | null,
    public readonly organizationId: string | null,
    public readonly geolocation: {
      latitude: string;
      longitude: string;
    } | null,
    public readonly type: TraceabilityEventType,
    public readonly data: T,
  ) {}

  static create<T extends TraceabilityEvent>(data: {
    ip: string | null;
    userId: string;
    itemId: string;
    chargeId?: string | null | undefined;
    organizationId: string;
    geolocation?:
      | {
          latitude: string;
          longitude: string;
        }
      | null
      | undefined;
    type: TraceabilityEventType;
    data: T;
  }) {
    return new TraceabilityEventWrapper(
      randomUUID(),
      new Date(),
      new Date(),
      data.ip,
      data.userId,
      data.itemId,
      data.chargeId,
      data.organizationId,
      data.geolocation,
      data.type,
      data.data,
    );
  }

  static loadFromDb<T extends TraceabilityEvent>(
    plain: any,
  ): TraceabilityEventWrapper<T> {
    return new TraceabilityEventWrapper(
      plain._id || randomUUID(),
      plain.createdAt || new Date(),
      plain.updatedAt || new Date(),
      plain.ip,
      plain.userId,
      plain.itemId,
      plain.chargeId,
      plain.organizationId,
      plain.geolocation,
      plain.type,
      plain.data,
    );
  }
}
