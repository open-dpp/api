import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TraceabilityEventDocument } from './traceability-event.document';
import { TraceabilityEventWrapper } from '../domain/traceability-event-wrapper';
import { TraceabilityEventType } from '../domain/traceability-event-type.enum';
import { OpenDppEvent } from '../modules/open-dpp/domain/open-dpp-event';
import { OpenDppEventData } from '../modules/open-dpp/domain/open-dpp-event-data';
import { AuthContext } from '../../auth/auth-request';

@Injectable()
export class TraceabilityEventsService {
  constructor(
    @InjectModel(TraceabilityEventDocument.name)
    private traceabilityEventDocument: Model<TraceabilityEventDocument>,
  ) {}

  async create(dppEvent: TraceabilityEventWrapper, authContext?: AuthContext) {
    const newTraceabilityEvent = await this.traceabilityEventDocument.create({
      _id: dppEvent.id,
      data: dppEvent.data,
      createdAt: dppEvent.createdAt,
      updatedAt: new Date(),
      isCreatedBySystem: authContext === undefined,
      createdByUserId: authContext ? authContext.user.id : undefined,
    });
    return TraceabilityEventWrapper.loadFromDb(newTraceabilityEvent);
  }

  async saveOpenDppEventData(
    articleId: string,
    openDppEventData: OpenDppEventData,
    authContext?: AuthContext,
  ) {
    const openDppEvent = OpenDppEvent.create({ data: openDppEventData });
    const parentEvent = TraceabilityEventWrapper.create({
      userId: authContext.user.id,
      organizationId: authContext.user.id, // TODO: Organization ID
      articleId,
      data: openDppEvent,
    });
    return await this.create(parentEvent, authContext);
  }

  async findById(id: string) {
    const foundDocs = await this.traceabilityEventDocument
      .find(
        { _id: id },
        {
          _id: true,
          data: true,
          createdAt: true,
          updatedAt: true,
        },
      )
      .exec();
    return foundDocs.map((dm) => TraceabilityEventWrapper.loadFromDb(dm));
  }

  async findByDataType(type: TraceabilityEventType) {
    const foundData = await this.traceabilityEventDocument
      .find(
        {
          data: {
            type: type,
          },
        },
        {
          _id: true,
          data: true,
          createdAt: true,
          updatedAt: true,
        },
      )
      .exec();
    return foundData.map((dm) => TraceabilityEventWrapper.loadFromDb(dm));
  }
}
