import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Layout } from '../domain/layout';
import { LayoutDoc } from './layout.schema';
import { replaceIdByUnderscoreId, replaceUnderscoreIdToId } from '../../utils';
import { omit } from 'lodash';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

@Injectable()
export class LayoutService {
  constructor(
    @InjectModel(LayoutDoc.name)
    private layoutDoc: Model<LayoutDoc>,
  ) {}

  convertToDomain(layoutDoc: LayoutDoc) {
    const plain = layoutDoc.toObject();
    return Layout.fromPlain(replaceUnderscoreIdToId(plain));
  }

  async save(layout: Layout) {
    const data = replaceIdByUnderscoreId(omit(layout.toPlain(), 'id'));
    const dataModelDoc = await this.layoutDoc.findOneAndUpdate(
      { _id: layout.id },
      data,
      {
        new: true, // Return the updated document
        upsert: true,
        runValidators: true,
      },
    );

    return this.convertToDomain(dataModelDoc);
  }

  async findOneOrFail(id: string) {
    const layoutDoc = await this.layoutDoc.findById(id);
    if (!layoutDoc) {
      throw new NotFoundInDatabaseException(Layout.name);
    }
    return this.convertToDomain(layoutDoc);
  }
}
