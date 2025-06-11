import { Expose, Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { TraceabilityEvent } from './traceability-event';

export class TraceabilityEventWrapper {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly createdAt: Date = new Date();

  @Expose()
  readonly updatedAt: Date = new Date();

  @Expose()
  readonly ip: string | null = null;

  @Expose()
  readonly userId: string | null = null;

  @Expose()
  readonly articleId: string | null = null;

  @Expose()
  readonly chargeId: string | null = null;

  @Expose()
  readonly organizationId: string | null = null;

  @Expose()
  readonly geolocation: {
    latitude: string;
    longitude: string;
  } | null = null;

  @Expose()
  @Type(() => TraceabilityEvent)
  readonly data: TraceabilityEvent;

  private constructor(
    id: string | null,
    createdAt: Date | null,
    updatedAt: Date | null,
    ip: string | null,
    userId: string | null,
    articleId: string | null,
    chargeId: string | null,
    organizationId: string | null,
    geolocation: {
      latitude: string;
      longitude: string;
    } | null,
    data: TraceabilityEvent,
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
    this.data = data;
  }

  static create(data: {
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
    data: TraceabilityEvent;
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
      data.data,
    );
  }

  static loadFromDb(plain: any): TraceabilityEventWrapper {
    return new TraceabilityEventWrapper(
      plain._id,
      plain.createdAt,
      plain.updatedAt,
      plain.ip,
      plain.userId,
      plain.articleId,
      plain.chargeId,
      plain.organizationId,
      plain.geolocation,
      plain.data,
    );
  }
}
