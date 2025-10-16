import { MigrationInterface, QueryRunner } from "typeorm";

export class Carmodels1760521673271 implements MigrationInterface {
    name = 'Carmodels1760521673271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "carMake" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c2531bf193ec168f6a92ad408a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cars" ("id" SERIAL NOT NULL, "model" character varying NOT NULL, "makeId" integer NOT NULL, "categoryId" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fc218aa84e79b477d55322271b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_642f9276e31cb67bd99041dcf0" ON "cars" ("makeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b8f2af5403621c1527f4c76609" ON "cars" ("categoryId") `);
        await queryRunner.query(`CREATE TABLE "carCategory" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_958d11667ae6603d3b9c0d3bc07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_642f9276e31cb67bd99041dcf0c" FOREIGN KEY ("makeId") REFERENCES "carMake"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_b8f2af5403621c1527f4c76609f" FOREIGN KEY ("categoryId") REFERENCES "carCategory"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_b8f2af5403621c1527f4c76609f"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_642f9276e31cb67bd99041dcf0c"`);
        await queryRunner.query(`DROP TABLE "carCategory"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b8f2af5403621c1527f4c76609"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_642f9276e31cb67bd99041dcf0"`);
        await queryRunner.query(`DROP TABLE "cars"`);
        await queryRunner.query(`DROP TABLE "carMake"`);
    }

}
