import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DppEventDocument } from './dpp-event.document';
import { DppEvent } from '../domain/dpp-event';
import { DppEventType } from '../domain/dpp-event-type.enum';
import { OpenDppEvent } from '../modules/open-dpp/domain/open-dpp-event';
import { OpenDppEventData } from '../modules/open-dpp/domain/open-dpp-event-data';
import { AuthContext } from '../../auth/auth-request';

@Injectable()
export class DppEventsService {
  constructor(
    @InjectModel(DppEventDocument.name)
    private dppEventDocument: Model<DppEventDocument>,
  ) {}

  convertToDomain(dppEventDocument: DppEventDocument) {
    return DppEvent.fromPlain(this.documentToDomainPlain(dppEventDocument));
  }

  async save(dppEvent: DppEvent, authContext?: AuthContext) {
    const documentPlain = this.domainToDocumentPlain(dppEvent);
    const dppEventDoc = await this.dppEventDocument.create({
      _id: documentPlain._id,
      data: documentPlain.data,
      createdAt: documentPlain.createdAt,
      updatedAt: documentPlain.updatedAt,
      isCreatedBySystem: authContext === undefined,
      createdByUserId: authContext ? authContext.user.id : undefined,
    });
    return this.convertToDomain(dppEventDoc);
  }

  async saveOpenDppEventData(
    openDppEventData: OpenDppEventData,
    authContext?: AuthContext,
  ) {
    const childOdppEvent = OpenDppEvent.create({ data: openDppEventData });
    const parentEvent = DppEvent.create({
      data: childOdppEvent,
    });
    return await this.save(parentEvent, authContext);
  }

  async findById(id: string) {
    const foundDocs = await this.dppEventDocument
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
    return foundDocs.map((dm) => this.convertToDomain(dm));
  }

  async findByDataType(type: DppEventType) {
    const foundData = await this.dppEventDocument
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
    return foundData.map((dm) => this.convertToDomain(dm));
  }

  private documentToDomainPlain(dppEventDocument: DppEventDocument) {
    return {
      id: dppEventDocument._id,
      data: dppEventDocument.data,
      createdAt: dppEventDocument.createdAt,
      updatedAt: dppEventDocument.updatedAt,
    };
  }

  private domainToDocumentPlain(dppEvent: DppEvent) {
    // Convert the domain object to a plain object suitable for the document
    const plain = dppEvent.toPlain();
    return {
      _id: plain.id,
      data: plain.data,
      createdAt: plain.createdAt,
      updatedAt: new Date(), // Always update the updatedAt field
    };
  }
}
