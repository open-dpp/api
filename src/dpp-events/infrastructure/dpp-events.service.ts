import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DppEventDocument } from './dpp-event.document';
import { DppEvent } from '../domain/dpp-event';

@Injectable()
export class DppEventsService {
  constructor(
    @InjectModel(DppEventDocument.name)
    private dppEventDocument: Model<DppEventDocument>,
  ) {}

  convertToDomain(dppEventDocument: DppEventDocument) {
    return DppEvent.fromPlain(this.documentToDomainPlain(dppEventDocument));
  }

  async save(dppEvent: DppEvent) {
    const documentPlain = this.domainToDocumentPlain(dppEvent);
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
