import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { TargetGroup, View } from '../domain/view';
import { ViewDoc } from './view.schema';
import { replaceIdByUnderscoreId, replaceUnderscoreIdToId } from '../../utils';
import { omit } from 'lodash';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

@Injectable()
export class ViewService {
  constructor(
    @InjectModel(ViewDoc.name)
    private viewDoc: Model<ViewDoc>,
  ) {}

  convertToDomain(viewDoc: ViewDoc) {
    const plain = viewDoc.toObject();
    return View.fromPlain(replaceUnderscoreIdToId(plain));
  }

  async save(view: View, session?: ClientSession) {
    const data = replaceIdByUnderscoreId(omit(view.toPlain(), 'id'));
    const dataModelDoc = await this.viewDoc.findOneAndUpdate(
      { _id: view.id },
      data,
      {
        new: true, // Return the updated document
        upsert: true,
        runValidators: true,
        session,
      },
    );

    return this.convertToDomain(dataModelDoc);
  }

  async findOneOrFail(id: string) {
    const layoutDoc = await this.viewDoc.findById(id);
    if (!layoutDoc) {
      throw new NotFoundInDatabaseException(View.name);
    }
    return this.convertToDomain(layoutDoc);
  }

  async findOneByDataModelAndTargetGroupOrFail(
    dataModelId: string,
    targetGroup: TargetGroup,
  ) {
    const layoutDoc = await this.viewDoc.findOne({
      dataModelId: dataModelId,
      targetGroup: targetGroup,
    });
    if (!layoutDoc) {
      throw new NotFoundInDatabaseException(View.name);
    }
    return this.convertToDomain(layoutDoc);
  }
}
