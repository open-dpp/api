import { PassportDoc } from './product-passport.schema';

export function migratePassportDocToTemplateId(passportDoc: PassportDoc) {
  if (passportDoc.productDataModelId) {
    passportDoc.templateId = passportDoc.productDataModelId;
  }
}
