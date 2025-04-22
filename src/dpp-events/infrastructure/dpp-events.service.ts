import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DppEventDocument } from './dpp-event.document';
import { DppEvent } from '../domain/dpp-event';
import { DppEventType } from '../domain/dpp-event-type.enum';
import { OpenDppEvent } from '../modules/open-dpp/domain/open-dpp-event';
import { OpenDppEventDocument } from '../modules/open-dpp/infrastructure/open-dpp-event.document';
import { ItemCreatedEventDocument } from '../modules/open-dpp/infrastructure/open-dpp-events/item-created.event-document';
import { OpenDppEventType } from '../modules/open-dpp/domain/open-dpp-event-type.enum';
import { ItemCreatedEvent } from '../modules/open-dpp/domain/open-dpp-events/item-created.event';
import { UniqueProductIdentifierCreatedEvent } from '../modules/open-dpp/domain/open-dpp-events/unique-product-identifier-created.event';
import { UniqueProductIdentifierCreatedEventDocument } from '../modules/open-dpp/infrastructure/open-dpp-events/unique-product-identifier-created.event-document';

@Injectable()
export class DppEventsService {
  constructor(
    @InjectModel(DppEventDocument.name)
    private dppEventDocument: Model<DppEventDocument>,
    @InjectModel(DppEventType.OPEN_DPP)
    private openDppEventDocument: Model<OpenDppEventDocument>,
    @InjectModel(ItemCreatedEventDocument.name)
    private itemCreatedEventDocument: Model<ItemCreatedEventDocument>,
    @InjectModel(UniqueProductIdentifierCreatedEventDocument.name)
    private uniqueProductIdentifierCreatedEventDocument: Model<UniqueProductIdentifierCreatedEventDocument>,
  ) {}

  convertToDomain(dppEventDocument: DppEventDocument) {
    return DppEvent.fromPlain(this.documentToDomainPlain(dppEventDocument));
  }

  async save(dppEvent: DppEvent) {
    const documentPlain = this.domainToDocumentPlain(dppEvent);
    if (dppEvent.kind === DppEventType.OPEN_DPP) {
      const childEvent = dppEvent.data as OpenDppEvent;
      if (childEvent.subKind === OpenDppEventType.ITEM_CREATED) {
        const childEventData = childEvent.data as ItemCreatedEvent;
        await this.itemCreatedEventDocument.create({
          _id: childEventData.id,
          itemId: childEventData.itemId,
        });
      } else if (
        childEvent.subKind ===
        OpenDppEventType.UNIQUE_PRODUCT_IDENTIFIER_CREATED
      ) {
        const childEventData =
          childEvent.data as UniqueProductIdentifierCreatedEvent;
        await this.uniqueProductIdentifierCreatedEventDocument.create({
          _id: childEventData.id,
          uniqueProductIdentifierId: childEventData.uniqueProductIdentifierId,
        });
      }
    }
    const dppEventDoc = await this.dppEventDocument.create({
      _id: documentPlain._id,
      kind: documentPlain.kind,
      createdAt: documentPlain.createdAt,
      updatedAt: documentPlain.updatedAt,
    });
    return this.convertToDomain(dppEventDoc);
  }

  async findById(id: string) {
    const foundDocs = await this.dppEventDocument
      .find(
        { _id: id },
        {
          _id: true,
          kind: true,
          createdAt: true,
          updatedAt: true,
        },
      )
      .exec();
    return foundDocs.map((dm) => this.convertToDomain(dm));
  }

  async findByKind(kind: string) {
    const foundData = await this.dppEventDocument
      .find(
        { kind },
        {
          _id: true,
          kind: true,
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
      kind: dppEventDocument.kind,
      createdAt: dppEventDocument.createdAt,
      updatedAt: dppEventDocument.updatedAt,
    };
  }

  private domainToDocumentPlain(dppEvent: DppEvent) {
    // Convert the domain object to a plain object suitable for the document
    const plain = dppEvent.toPlain();
    return {
      _id: plain.id,
      kind: plain.kind,
      createdAt: plain.createdAt,
      updatedAt: new Date(), // Always update the updatedAt field
    };
  }
}
