import { MigrationInterface, QueryRunner } from "typeorm";

export class NewcolumnBanner1762411934780 implements MigrationInterface {
    name = 'NewcolumnBanner1762411934780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banner" ADD "bgColour" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banner" DROP COLUMN "bgColour"`);
    }

}
