import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TemplateDraftDoc,
  TemplateDraftDocSchemaVersion,
} from './template-draft.schema';
import { TemplateDraft } from '../domain/template-draft';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';
import { SectionType } from '../../data-modelling/domain/section-base';
import { GranularityLevel } from '../../data-modelling/domain/granularity-level';
import {
  DataFieldDoc,
  SectionDoc,
} from '../../data-modelling/infrastructure/product-data-model-base.schema';
import { DataFieldDraft } from '../domain/data-field-draft';
import { Layout } from '../../data-modelling/domain/layout';
import { DataSectionDraft } from '../domain/section-draft';

@Injectable()
export class TemplateDraftService {
  constructor(
    @InjectModel(TemplateDraftDoc.name)
    private templateDraftDocModel: Model<TemplateDraftDoc>,
  ) {}

  async save(
    templateDraft: TemplateDraft,
    newVersion?: string,
  ): Promise<TemplateDraft> {
    const draftDoc = await this.templateDraftDocModel.findOneAndUpdate(
      { _id: templateDraft.id },
      {
        name: templateDraft.name,
        description: templateDraft.description,
        sectors: templateDraft.sectors,
        version: newVersion || templateDraft.version,
        _schemaVersion: TemplateDraftDocSchemaVersion.v1_0_2,
        publications: templateDraft.publications,
        sections: templateDraft.sections.map((s) => ({
          _id: s.id,
          name: s.name,
          type: s.type,
          dataFields: s.dataFields.map((d) => ({
            _id: d.id,
            name: d.name,
            type: d.type,
            options: d.options,
            layout: {
              colStart: d.layout.colStart,
              colSpan: d.layout.colSpan,
              rowStart: d.layout.rowStart,
              rowSpan: d.layout.rowSpan,
            },
            granularityLevel: d.granularityLevel,
          })),
          parentId: s.parentId,
          layout: {
            colStart: s.layout.colStart,
            colSpan: s.layout.colSpan,
            rowStart: s.layout.rowStart,
            rowSpan: s.layout.rowSpan,
            cols: s.layout.cols,
          },
          subSections: s.subSections,
          granularityLevel: s.granularityLevel,
        })),
        createdByUserId: templateDraft.createdByUserId,
        ownedByOrganizationId: templateDraft.ownedByOrganizationId,
      },
      {
        new: true, // Return the updated document
        upsert: true,
        runValidators: true,
      },
    );

    return this.convertToDomain(draftDoc);
  }

  createDataField(dataFieldDoc: DataFieldDoc) {
    return DataFieldDraft.loadFromDb({
      id: dataFieldDoc._id,
      name: dataFieldDoc.name,
      type: dataFieldDoc.type,
      options: dataFieldDoc.options,
      layout: Layout.create({
        colStart: dataFieldDoc.layout.colStart,
        colSpan: dataFieldDoc.layout.colSpan,
        rowStart: dataFieldDoc.layout.rowStart,
        rowSpan: dataFieldDoc.layout.rowSpan,
      }),
      granularityLevel: dataFieldDoc.granularityLevel,
    });
  }

  createSection(sectionDoc: SectionDoc) {
    return DataSectionDraft.loadFromDb({
      id: sectionDoc._id,
      name: sectionDoc.name,
      type: sectionDoc.type,
      layout: Layout.create({
        colStart: sectionDoc.layout.colStart,
        colSpan: sectionDoc.layout.colSpan,
        rowStart: sectionDoc.layout.rowStart,
        rowSpan: sectionDoc.layout.rowSpan,
        cols: sectionDoc.layout.cols,
      }),
      subSections: sectionDoc.subSections,
      parentId: sectionDoc.parentId,
      dataFields: sectionDoc.dataFields.map((d) => this.createDataField(d)),
      granularityLevel: sectionDoc.granularityLevel
        ? sectionDoc.granularityLevel
        : sectionDoc.type === SectionType.REPEATABLE
          ? GranularityLevel.MODEL
          : undefined,
    });
  }

  convertToDomain(templateDraftDocModel: TemplateDraftDoc) {
    const plainDoc = templateDraftDocModel.toObject();

    return TemplateDraft.loadFromDb({
      id: plainDoc._id,
      name: plainDoc.name,
      description: plainDoc.description,
      sectors: plainDoc.sectors,
      version: plainDoc.version,
      sections: plainDoc.sections.map((s) => this.createSection(s)),
      publications: plainDoc.publications,
      userId: plainDoc.createdByUserId,
      organizationId: plainDoc.ownedByOrganizationId,
    });
  }

  async findOneOrFail(id: string) {
    const draftDoc = await this.templateDraftDocModel.findById(id).exec();
    if (!draftDoc) {
      throw new NotFoundInDatabaseException(TemplateDraft.name);
    }
    return this.convertToDomain(draftDoc);
  }

  async findAllByOrganization(organizationId: string) {
    return (
      await this.templateDraftDocModel
        .find({ ownedByOrganizationId: organizationId }, '_id name')
        .sort({ name: 1 })
        .exec()
    ).map((p) => {
      const plain = p.toObject();
      return { id: plain._id, name: plain.name };
    });
  }
}
