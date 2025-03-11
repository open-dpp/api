import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1741690175018 implements MigrationInterface {
  name = 'DeleteDataFieldOnSectionDelete1741690175018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_field_draft" DROP CONSTRAINT "FK_70d7cc401990e2aeac09ad3d4c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ALTER COLUMN "publications" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_field_draft" ADD CONSTRAINT "FK_70d7cc401990e2aeac09ad3d4c1" FOREIGN KEY ("sectionId") REFERENCES "data_section_draft"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_field_draft" DROP CONSTRAINT "FK_70d7cc401990e2aeac09ad3d4c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ALTER COLUMN "publications" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_field_draft" ADD CONSTRAINT "FK_70d7cc401990e2aeac09ad3d4c1" FOREIGN KEY ("sectionId") REFERENCES "data_section_draft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
