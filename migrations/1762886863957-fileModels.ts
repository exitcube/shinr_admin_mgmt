import { MigrationInterface, QueryRunner } from "typeorm";

export class FileModels1762886863957 implements MigrationInterface {
    name = 'FileModels1762886863957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "fileName" character varying NOT NULL, "storageLocation" character varying NOT NULL, "mimeType" character varying NOT NULL, "sizeBytes" bigint NOT NULL, "provider" character varying, "url" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."adminfile_category_enum" AS ENUM('license', 'rc', 'insurance', 'other')`);
        await queryRunner.query(`CREATE TABLE "adminfile" ("id" SERIAL NOT NULL, "adminId" integer NOT NULL, "fileId" integer NOT NULL, "category" "public"."adminfile_category_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed1c254e7beafc11ff373d1df92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b2a3582d24d1e37754f16ac01b" ON "adminfile" ("adminId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b513986eae0ff7b6251eba4df" ON "adminfile" ("fileId") `);
        await queryRunner.query(`ALTER TABLE "adminfile" ADD CONSTRAINT "FK_b2a3582d24d1e37754f16ac01bf" FOREIGN KEY ("adminId") REFERENCES "adminUser"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "adminfile" ADD CONSTRAINT "FK_8b513986eae0ff7b6251eba4df8" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "adminfile" DROP CONSTRAINT "FK_8b513986eae0ff7b6251eba4df8"`);
        await queryRunner.query(`ALTER TABLE "adminfile" DROP CONSTRAINT "FK_b2a3582d24d1e37754f16ac01bf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b513986eae0ff7b6251eba4df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2a3582d24d1e37754f16ac01b"`);
        await queryRunner.query(`DROP TABLE "adminfile"`);
        await queryRunner.query(`DROP TYPE "public"."adminfile_category_enum"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
