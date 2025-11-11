import { MigrationInterface, QueryRunner } from "typeorm";

export class AdminTokenTable1762859860387 implements MigrationInterface {
    name = 'AdminTokenTable1762859860387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "adminToken" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "refreshToken" text NOT NULL, "accessToken" character varying NOT NULL, "refreshTokenExpiry" TIMESTAMP, "refreshTokenStatus" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18485fa0b06d6486aac1472bbe4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_83cbb625983fe26892df4dbec6" ON "adminToken" ("userId") `);
        await queryRunner.query(`ALTER TABLE "adminToken" ADD CONSTRAINT "FK_83cbb625983fe26892df4dbec69" FOREIGN KEY ("userId") REFERENCES "adminUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "adminToken" DROP CONSTRAINT "FK_83cbb625983fe26892df4dbec69"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_83cbb625983fe26892df4dbec6"`);
        await queryRunner.query(`DROP TABLE "adminToken"`);
    }

}
