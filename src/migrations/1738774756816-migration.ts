import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1738774756816 implements MigrationInterface {
    name = 'Migration1738774756816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "data_value" ("id" uuid NOT NULL, "value" jsonb, "dataSectionId" uuid NOT NULL, "dataFieldId" uuid NOT NULL, "modelId" uuid, CONSTRAINT "PK_6064d0be9bb5a1130024c9f9421" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD "productDataModelId" uuid`);
        await queryRunner.query(`ALTER TABLE "data_value" ADD CONSTRAINT "FK_da4f77c4787740d3c5d21662cb5" FOREIGN KEY ("modelId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "data_value" DROP CONSTRAINT "FK_da4f77c4787740d3c5d21662cb5"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "productDataModelId"`);
        await queryRunner.query(`DROP TABLE "data_value"`);
    }

}
