import { Expose } from 'class-transformer';
import { randomUUID } from 'crypto';
import { TraceabilityEvent } from './traceability-event';
import { TraceabilityEventType } from './traceability-event-type.enum';

export class TraceabilityEventWrapper<T extends TraceabilityEvent> {
  @Expose()
  readonly id: string;

  @Expose()
  readonly createdAt: Date;

  @Expose()
  readonly updatedAt: Date;

  @Expose()
  readonly ip: string | null;

  @Expose()
  readonly userId: string | null;

  @Expose()
  readonly articleId: string | null;

  @Expose()
  readonly chargeId: string | null;

  @Expose()
  readonly organizationId: string | null;

  @Expose()
  readonly geolocation: {
    latitude: string;
    longitude: string;
  } | null;

  @Expose()
  readonly type: TraceabilityEventType;

  @Expose()
  readonly data: T;

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    ip: string | null,
    userId: string | null,
    articleId: string | null,
    chargeId: string | null,
    organizationId: string | null,
    geolocation: {
      latitude: string;
      longitude: string;
    } | null,
    type: TraceabilityEventType,
    data: T,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.ip = ip;
    this.userId = userId;
    this.articleId = articleId;
    this.chargeId = chargeId;
    this.organizationId = organizationId;
    this.geolocation = geolocation;
    this.type = type;
    this.data = data;
  }

  static create<T extends TraceabilityEvent>(data: {
    ip?: string | null | undefined;
    userId: string;
    articleId: string;
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
      data.articleId,
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
      plain.articleId,
      plain.chargeId,
      plain.organizationId,
      plain.geolocation,
      plain.type,
      plain.data,
    );
  }
}
