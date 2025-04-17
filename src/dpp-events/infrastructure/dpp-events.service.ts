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
    return DppEvent.fromPlain({
      id: dppEventDocument._id,
      type: dppEventDocument.type,
      dppId: dppEventDocument.dppId,
      eventJsonData: dppEventDocument.eventJsonData,
    });
  }

  async save(dppEvent: DppEvent) {
    const dppEventDoc = await this.dppEventDocument.findOneAndUpdate(
      { _id: dppEvent.id },
      {
        type: dppEvent.type,
        dppId: dppEvent.dppId,
        eventJsonData: dppEvent.eventJsonData,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none found
      },
    );

    return this.convertToDomain(dppEventDoc);
  }

  async findById(id: string) {
    const foundDocs = await this.dppEventDocument
      .find({ _id: id }, '_id type dppId eventJsonData')
      .exec();
    return foundDocs.map((dm) => ({
      id: dm._id,
      type: dm.type,
      dppId: dm.dppId,
      eventJsonData: dm.eventJsonData,
    }));
  }

  async findByDppId(dppId: string) {
    const foundDocs = await this.dppEventDocument
      .find({ dppId }, '_id type dppId eventJsonData')
      .exec();
    return foundDocs.map((dm) => ({
      id: dm._id,
      type: dm.type,
      dppId: dm.dppId,
      eventJsonData: dm.eventJsonData,
    }));
  }

  async findByType(type: string) {
    const foundData = await this.dppEventDocument
      .find({ type }, '_id type dppId eventJsonData')
      .exec();
    return foundData.map((dm) => ({
      id: dm._id,
      type: dm.type,
      dppId: dm.dppId,
      eventJsonData: dm.eventJsonData,
    }));
  }
}
