import { ModelDoc, ModelDocSchemaVersion } from './model.schema';
import { migratePassportDocToVersion_1_0_1 } from '../../product-passport/infrastructure/migrations';

function migrateToVersion_1_0_1(modelDoc: ModelDoc) {
  migratePassportDocToVersion_1_0_1(modelDoc);
  modelDoc._schemaVersion = ModelDocSchemaVersion.v1_0_1;
}

export function migrateModelDoc(modelDoc: ModelDoc) {
  if (modelDoc._schemaVersion === ModelDocSchemaVersion.v1_0_0) {
    migrateToVersion_1_0_1(modelDoc);
  }
}
