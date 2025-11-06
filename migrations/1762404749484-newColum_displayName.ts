import { MigrationInterface, QueryRunner } from "typeorm";

export class NewColumDisplayName1762404749484 implements MigrationInterface {
    name = 'NewColumDisplayName1762404749484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" ADD "displayName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "UQ_a9c61a8e67aeedc9de8d7f7ccf1" UNIQUE ("displayName")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "UQ_a9c61a8e67aeedc9de8d7f7ccf1"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "displayName"`);
    }

}
