import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1738520732607 implements MigrationInterface {
  name = 'Migration1738520732607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item" DROP CONSTRAINT "FK_5519c7b895f8c870338750c6530"`,
    );
    await queryRunner.query(
      `CREATE TABLE "model" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "description" character varying NOT NULL, "createdByUserId" character varying NOT NULL, CONSTRAINT "PK_d6df271bba301d5cc79462912a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "FK_5519c7b895f8c870338750c6530" FOREIGN KEY ("modelId") REFERENCES "model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "model" ADD CONSTRAINT "FK_fb18411db6f84a55ee00629b983" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "model" DROP CONSTRAINT "FK_fb18411db6f84a55ee00629b983"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" DROP CONSTRAINT "FK_5519c7b895f8c870338750c6530"`,
    );
    await queryRunner.query(`DROP TABLE "model"`);
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "FK_5519c7b895f8c870338750c6530" FOREIGN KEY ("modelId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
