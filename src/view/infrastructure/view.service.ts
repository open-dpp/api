import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../domain/view';
import { ViewDoc } from './view.schema';
import { replaceIdByUnderscoreId, replaceUnderscoreIdToId } from '../../utils';
import { omit } from 'lodash';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

@Injectable()
export class ViewService {
  constructor(
    @InjectModel(ViewDoc.name)
    private layoutDoc: Model<ViewDoc>,
  ) {}

  convertToDomain(layoutDoc: ViewDoc) {
    const plain = layoutDoc.toObject();
    return View.fromPlain(replaceUnderscoreIdToId(plain));
  }

  async save(layout: View) {
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
      throw new NotFoundInDatabaseException(View.name);
    }
    return this.convertToDomain(layoutDoc);
  }

  async findOneByDataModelIdOrFail(dataModelId: string) {
    const layoutDoc = await this.layoutDoc.findOne({
      dataModelId: dataModelId,
    });
    if (!layoutDoc) {
      throw new NotFoundInDatabaseException(View.name);
    }
    return this.convertToDomain(layoutDoc);
  }
}
