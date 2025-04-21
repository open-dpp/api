import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { OpenDppEventType } from './open-dpp-event-type.enum';

export enum OpenDppEventSchemaVersion {
  v1_0_0 = '1.0.0',
}

export class OpenDppEvent {
  @Expose()
  readonly id: string = randomUUID();

  @Expose()
  readonly kind: OpenDppEventType;

  @Expose()
  readonly type: OpenDppEventType;

  @Expose()
  readonly subType?: string;

  @Expose()
  readonly source?: string;

  @Expose()
  readonly eventJsonData?: any;

  @Expose()
  readonly schemaVersion?: OpenDppEventSchemaVersion;

  @Expose()
  readonly createdAt: Date = new Date();

  @Expose()
  readonly updatedAt: Date = new Date();

  static create(plain: {
    kind: OpenDppEventType;
    schemaVersion?: OpenDppEventSchemaVersion;
  }) {
    return OpenDppEvent.fromPlain({
      ...plain,
    });
  }

  static fromPlain(plain: unknown): OpenDppEvent {
    // If kind is not provided but type is, set kind to the same value as type
    const plainObj = plain as any;
    if (!plainObj.kind && plainObj.type) {
      plainObj.kind = plainObj.type;
    }

    return plainToInstance(OpenDppEvent, plainObj, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });
  }

  toPlain() {
    return instanceToPlain(this);
  }
}
