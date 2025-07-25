import { migratePassportDocToVersion_1_0_1 } from '../../product-passport/infrastructure/migrations';
import { ItemDoc, ItemDocSchemaVersion } from './item.schema';

function migrateToVersion_1_0_1(itemDoc: ItemDoc) {
  migratePassportDocToVersion_1_0_1(itemDoc);
  itemDoc._schemaVersion = ItemDocSchemaVersion.v1_0_1;
}

export function migrateItemDoc(itemDoc: ItemDoc) {
  if (itemDoc._schemaVersion === ItemDocSchemaVersion.v1_0_0) {
    migrateToVersion_1_0_1(itemDoc);
  }
}
