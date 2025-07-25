import { PassportDoc } from './product-passport.schema';

export function migratePassportDocToVersion_1_0_1(passportDoc: PassportDoc) {
  if (passportDoc.productDataModelId) {
    passportDoc.templateId = passportDoc.productDataModelId;
  }
}
