import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1738750942441 implements MigrationInterface {
  name = 'AddProductDataModel1738686045739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."data_field_type_enum" AS ENUM('TextField')`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_field" ("id" uuid NOT NULL, "name" character varying NOT NULL, "type" "public"."data_field_type_enum" NOT NULL, "options" jsonb NOT NULL, "sectionId" uuid, CONSTRAINT "PK_3a8385bfd834043ee3e0eadc5b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_data_model" ("id" uuid NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_894e5d05d765d5ac4d53e7f90d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_section" ("id" uuid NOT NULL, "productDataModelId" uuid, CONSTRAINT "PK_334dc9e78d2d81885f33efa2cbc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_field" ADD CONSTRAINT "FK_115d0254db70b12694d8fda58eb" FOREIGN KEY ("sectionId") REFERENCES "data_section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_section" ADD CONSTRAINT "FK_a1eaec690ff5df7607e09179084" FOREIGN KEY ("productDataModelId") REFERENCES "product_data_model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_section" DROP CONSTRAINT "FK_a1eaec690ff5df7607e09179084"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_field" DROP CONSTRAINT "FK_115d0254db70b12694d8fda58eb"`,
    );
    await queryRunner.query(`DROP TABLE "data_section"`);
    await queryRunner.query(`DROP TABLE "product_data_model"`);
    await queryRunner.query(`DROP TABLE "data_field"`);
    await queryRunner.query(`DROP TYPE "public"."data_field_type_enum"`);
  }
}
