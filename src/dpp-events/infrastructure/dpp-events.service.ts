import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DppEventDocument } from './dpp-event.document';
import { DppEvent } from '../domain/dpp-event';
import { DppEventType } from '../domain/dpp-event-type.enum';
import { OpenDppEvent } from '../modules/open-dpp/domain/open-dpp-event';
import { OpenDppEventData } from '../modules/open-dpp/domain/open-dpp-event-data';
import { AuthContext } from '../../auth/auth-request';
import { DppEventIdentifierTypes } from '../domain/dpp-event-identifier-types.enum';
import { DppEventIdentifier } from '../domain/dpp-event-identifier';
import { DppEventIdentifierUser } from '../domain/dpp-event-identifier-user';
import { DppEventIdentifierSystem } from '../domain/dpp-event-identifier-system';
import { DppEventIdentifierAnonymous } from '../domain/dpp-event-identifier-anonymous';

@Injectable()
export class DppEventsService {
  constructor(
    @InjectModel(DppEventDocument.name)
    private dppEventDocument: Model<DppEventDocument>,
  ) {}

  convertToDomain(dppEventDocument: DppEventDocument) {
    return DppEvent.fromPlain(this.documentToDomainPlain(dppEventDocument));
  }

  getIdentifierFromAuthContext(authContext?: AuthContext): DppEventIdentifier {
    if (!authContext) {
      return {
        type: DppEventIdentifierTypes.SYSTEM,
      } as DppEventIdentifierSystem;
    }
    if (authContext.user) {
      return {
        type: DppEventIdentifierTypes.USER,
        createdByUserId: authContext.user.id,
      } as DppEventIdentifierUser;
    } else {
      return {
        type: DppEventIdentifierTypes.ANONYMOUS,
      } as DppEventIdentifierAnonymous;
    }
  }

  async create(dppEvent: DppEvent, authContext?: AuthContext) {
    const documentPlain = this.domainToDocumentPlain(dppEvent);
    const dppEventDoc = await this.dppEventDocument.create({
      _id: documentPlain._id,
      data: documentPlain.data,
      createdAt: documentPlain.createdAt,
      updatedAt: new Date(),
      identifier: this.getIdentifierFromAuthContext(authContext),
      isCreatedBySystem: authContext === undefined,
      createdByUserId: authContext ? authContext.user.id : undefined,
    });
    return this.convertToDomain(dppEventDoc);
  }

  async saveOpenDppEventData(
    openDppEventData: OpenDppEventData,
    authContext?: AuthContext,
  ) {
    const openDppEvent = OpenDppEvent.create({ data: openDppEventData });
    const parentEvent = DppEvent.create({
      data: openDppEvent,
    });
    return await this.create(parentEvent, authContext);
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
          identifier: true,
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
          identifier: true,
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
      identifier: dppEventDocument.identifier,
    };
  }

  private domainToDocumentPlain(dppEvent: DppEvent) {
    const plain = dppEvent.toPlain();
    return {
      _id: plain.id,
      data: plain.data,
      createdAt: plain.createdAt,
      updatedAt: dppEvent.updatedAt,
      identifier: plain.identifier,
    };
  }
}
