import { MigrationInterface, QueryRunner } from "typeorm";

export class Banner1762331698504 implements MigrationInterface {
    name = 'Banner1762331698504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "banner" ("id" SERIAL NOT NULL, "isImage" boolean NOT NULL DEFAULT false, "text" text, "bgImageId" character varying, "isActive" boolean NOT NULL DEFAULT false, "buttonText" character varying, "targetValue" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "banner"`);
    }

}
