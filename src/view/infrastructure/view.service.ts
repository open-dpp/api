import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { PageDoc } from './page.schema';
import { Page } from '../domain/page';
import { isArray, isObject, mapKeys, mapValues, omit } from 'lodash';

@Injectable()
export class ViewService {
  constructor(
    @InjectModel(PageDoc.name)
    private pageDoc: Model<PageDoc>,
  ) {}

  async save(page: Page): Promise<Page> {
    const draftDoc = await this.pageDoc.findOneAndUpdate(
      { _id: page._id },
      omit(page.toPlain(), '_id'),
      {
        new: true, // Return the updated document
        upsert: true,
        runValidators: true,
      },
    );

    return this.convertToDomain(draftDoc);
  }

  convertToDomain(pageDoc: PageDoc) {
    const plainDoc = pageDoc.toObject();
    return Page.fromPlain({ ...plainDoc });
  }

  async findOneOrFail(id: string) {
    const pageDoc = await this.pageDoc.findById(id).exec();
    if (!pageDoc) {
      throw new NotFoundInDatabaseException(Page.name);
    }
    return this.convertToDomain(pageDoc);
  }
}
