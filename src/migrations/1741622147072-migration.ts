import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1741622147072 implements MigrationInterface {
  name = 'AddPublicationsColumn1741622147072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ADD "publications" text NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" DROP CONSTRAINT "FK_e6b6073094e70869523990bc3fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ALTER COLUMN "createdByUserId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ADD CONSTRAINT "FK_e6b6073094e70869523990bc3fb" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" DROP CONSTRAINT "FK_e6b6073094e70869523990bc3fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ALTER COLUMN "createdByUserId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ADD CONSTRAINT "FK_e6b6073094e70869523990bc3fb" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" DROP COLUMN "publications"`,
    );
  }
}
