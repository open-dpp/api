import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1741362032415 implements MigrationInterface {
  name = 'AddProductDataModelDraftTables1741362032415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "model" DROP CONSTRAINT "FK_fb18411db6f84a55ee00629b983"`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_field_draft" ("id" uuid NOT NULL, "name" character varying NOT NULL, "type" text NOT NULL, "options" jsonb NOT NULL, "sectionId" uuid, CONSTRAINT "PK_af62554752f3c0687091a915fac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_section_draft" ("id" uuid NOT NULL, "name" character varying NOT NULL, "type" text NOT NULL, "productDataModelId" uuid, CONSTRAINT "PK_54b59438ffb501d0699a0226c52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_data_model_draft" ("id" uuid NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "ownedByOrganizationId" uuid NOT NULL, "createdByUserId" character varying, CONSTRAINT "PK_77105a4504513cec81069a241ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "model" ADD CONSTRAINT "FK_fb18411db6f84a55ee00629b983" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_field_draft" ADD CONSTRAINT "FK_70d7cc401990e2aeac09ad3d4c1" FOREIGN KEY ("sectionId") REFERENCES "data_section_draft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_section_draft" ADD CONSTRAINT "FK_663001d264b5dea5267386e95e6" FOREIGN KEY ("productDataModelId") REFERENCES "product_data_model_draft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ADD CONSTRAINT "FK_e6b6073094e70869523990bc3fb" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" ADD CONSTRAINT "FK_57ecd99208b46f0a6da2a1d0fe7" FOREIGN KEY ("ownedByOrganizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" DROP CONSTRAINT "FK_57ecd99208b46f0a6da2a1d0fe7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_data_model_draft" DROP CONSTRAINT "FK_e6b6073094e70869523990bc3fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_section_draft" DROP CONSTRAINT "FK_663001d264b5dea5267386e95e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_field_draft" DROP CONSTRAINT "FK_70d7cc401990e2aeac09ad3d4c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "model" DROP CONSTRAINT "FK_fb18411db6f84a55ee00629b983"`,
    );
    await queryRunner.query(`DROP TABLE "product_data_model_draft"`);
    await queryRunner.query(`DROP TABLE "data_section_draft"`);
    await queryRunner.query(`DROP TABLE "data_field_draft"`);
    await queryRunner.query(
      `ALTER TABLE "model" ADD CONSTRAINT "FK_fb18411db6f84a55ee00629b983" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
