import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OpenDppEventDocument } from './open-dpp-event.document';
import {
  OpenDppEvent,
  OpenDppEventSchemaVersion,
} from '../domain/open-dpp-event';
import { UniqueProductIdentifierCreatedEvent } from '../domain/open-dpp-events/unique-product-identifier-created.event';

@Injectable()
export class OpenDppEventsService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(OpenDppEventDocument.name)
    private openDppEventDocument: Model<OpenDppEventDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.save(
      UniqueProductIdentifierCreatedEvent.create({
        uniqueProductIdentifierId: '123',
        schemaVersion: OpenDppEventSchemaVersion.v1_0_0,
      }),
    );
  }

  convertToDomain(openDppEventDocument: OpenDppEventDocument) {
    return OpenDppEvent.fromPlain(
      this.documentToDomainPlain(openDppEventDocument),
    );
  }

  async create(openDppEvent: OpenDppEvent) {
    const openDppEventDoc = await this.openDppEventDocument.create({
      _id: openDppEvent.id,
      _schemaVersion: openDppEvent.schemaVersion,
      createdAt: openDppEvent.createdAt,
      updatedAt: openDppEvent.updatedAt,
    });

    return this.convertToDomain(openDppEventDoc);
  }

  async save(openDppEvent: OpenDppEvent) {
    const documentPlain = this.domainToDocumentPlain(openDppEvent);
    const openDppEventDoc = await this.openDppEventDocument.findOneAndUpdate(
      { _id: documentPlain._id },
      documentPlain,
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none found
      },
    );

    return this.convertToDomain(openDppEventDoc);
  }

  async findById(id: string) {
    const foundDocs = await this.openDppEventDocument
      .find(
        { _id: id },
        {
          _id: true,
          type: true,
          _schemaVersion: true,
          source: true,
          eventJsonData: true,
          createdAt: true,
          updatedAt: true,
        },
      )
      .exec();
    return foundDocs.map((dm) => this.convertToDomain(dm));
  }

  async findByDppId(dppId: string) {
    const foundDocs = await this.openDppEventDocument
      .find(
        { source: dppId },
        {
          _id: true,
          type: true,
          _schemaVersion: true,
          source: true,
          eventJsonData: true,
          createdAt: true,
          updatedAt: true,
        },
      )
      .exec();
    return foundDocs.map((dm) => this.convertToDomain(dm));
  }

  async findByType(type: string) {
    const foundData = await this.openDppEventDocument
      .find(
        { type },
        {
          _id: true,
          type: true,
          _schemaVersion: true,
          source: true,
          eventJsonData: true,
          createdAt: true,
          updatedAt: true,
        },
      )
      .exec();
    return foundData.map((dm) => this.convertToDomain(dm));
  }

  private documentToDomainPlain(openDppEventDocument: OpenDppEventDocument) {
    return {
      id: openDppEventDocument._id,
      schemaVersion: openDppEventDocument._schemaVersion,
      createdAt: openDppEventDocument.createdAt,
      updatedAt: openDppEventDocument.updatedAt,
    };
  }

  private domainToDocumentPlain(openDppEvent: OpenDppEvent) {
    // Convert the domain object to a plain object suitable for the document
    const plain = openDppEvent.toPlain();
    return {
      _id: plain.id,
      type: plain.type,
      subType: plain.subType,
      _schemaVersion: plain.schemaVersion,
      source: plain.source,
      eventJsonData: plain.eventJsonData,
      createdAt: plain.createdAt,
      updatedAt: new Date(), // Always update the updatedAt field
    };
  }
}
