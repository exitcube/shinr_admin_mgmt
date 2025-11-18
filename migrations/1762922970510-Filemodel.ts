import { MigrationInterface, QueryRunner } from "typeorm";

export class Filemodel1762922970510 implements MigrationInterface {
    name = 'Filemodel1762922970510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "adminfile" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TYPE "public"."adminfile_category_enum"`);
        await queryRunner.query(`ALTER TABLE "adminfile" ADD "category" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "adminfile" DROP COLUMN "category"`);
        await queryRunner.query(`CREATE TYPE "public"."adminfile_category_enum" AS ENUM('license', 'rc', 'insurance', 'other')`);
        await queryRunner.query(`ALTER TABLE "adminfile" ADD "category" "public"."adminfile_category_enum" NOT NULL`);
    }

}
