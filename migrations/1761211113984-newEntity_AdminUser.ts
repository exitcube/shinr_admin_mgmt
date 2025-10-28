import { MigrationInterface, QueryRunner } from "typeorm";

export class NewEntityAdminUser1761211113984 implements MigrationInterface {
    name = 'NewEntityAdminUser1761211113984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "adminUser" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "userName" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f155e50a944f2658dc1ccb477a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9395dcb94215bc65fe851f46f1" ON "adminUser" ("uuid") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_9395dcb94215bc65fe851f46f1"`);
        await queryRunner.query(`DROP TABLE "adminUser"`);
    }

}
