import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProductDataModelDraftService } from '../../product-data-model-draft/infrastructure/product-data-model-draft.service';
import { ViewService } from './view.service';
import { ProductDataModelService } from '../../product-data-model/infrastructure/product-data-model.service';
import { TargetGroup, View } from '../domain/view';
import { ProductDataModel } from '../../product-data-model/domain/product.data.model';
import { DataFieldRef, SectionGrid } from '../domain/node';
import { NotFoundInDatabaseException } from '../../exceptions/service.exceptions';

// TODO: Delete after running import service
@Injectable()
export class ViewImportService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ViewImportService.name);

  constructor(
    private productDataModelService: ProductDataModelService,
    private productDataModelDraftService: ProductDataModelDraftService,
    private viewService: ViewService,
  ) {}
  async onApplicationBootstrap() {
    const productDataModels: ProductDataModel[] =
      await this.productDataModelService.findAll();
    const drafts = await this.productDataModelDraftService.findAll();

    // The dataModels and drafts which are currently in the database do not have nested sections. Therefore, it
    // is enough iterate over the sections without recursion

    // create and import views for data models
    for (const dataModel of productDataModels) {
      try {
        await this.viewService.findOneByDataModelAndTargetGroupOrFail(
          dataModel.id,
          TargetGroup.ALL,
        );
      } catch (e) {
        if (e instanceof NotFoundInDatabaseException) {
          const view = View.create({
            dataModelId: dataModel.id,
            targetGroup: TargetGroup.ALL,
          });

          for (const section of dataModel.sections) {
            const colsSm = 3;
            const sectionGrid = SectionGrid.create({
              sectionId: section.id,
              cols: { xs: 1, sm: colsSm },
              colSpan: { xs: 1, sm: 1 },
              colStart: { xs: 1, sm: 1 },
            });
            view.addNode(sectionGrid);
            for (const [index, dataField] of section.dataFields.entries()) {
              const dataFieldRef = DataFieldRef.create({
                fieldId: dataField.id,
                colSpan: { xs: 1, sm: 1 },
                colStart: { xs: 1, sm: (index % colsSm) + 1 },
              });
              view.addNode(dataFieldRef, sectionGrid.id);
            }
          }
          const savedView = this.viewService.save(view);
          this.logger.log(
            `Imported view ${JSON.stringify(savedView)} for data model with id ${dataModel.id}`,
          );
        }
      }
    }

    // create and import views for drafts
    for (const draft of drafts) {
      try {
        await this.viewService.findOneByDataModelAndTargetGroupOrFail(
          draft.id,
          TargetGroup.ALL,
        );
      } catch (e) {
        if (e instanceof NotFoundInDatabaseException) {
          const view = View.create({
            dataModelId: draft.id,
            targetGroup: TargetGroup.ALL,
          });

          for (const section of draft.sections) {
            const colsSm = 3;
            const sectionGrid = SectionGrid.create({
              sectionId: section.id,
              cols: { xs: 1, sm: colsSm },
              colSpan: { xs: 1, sm: 1 },
              colStart: { xs: 1, sm: 1 },
            });
            view.addNode(sectionGrid);
            for (const [index, dataField] of section.dataFields.entries()) {
              const dataFieldRef = DataFieldRef.create({
                fieldId: dataField.id,
                colSpan: { xs: 1, sm: 1 },
                colStart: { xs: 1, sm: (index % colsSm) + 1 },
              });
              view.addNode(dataFieldRef, sectionGrid.id);
            }
          }
          const savedView = this.viewService.save(view);
          this.logger.log(
            `Imported view ${JSON.stringify(savedView)} for draft with id ${draft.id}`,
          );
        }
      }
    }
  }
}
