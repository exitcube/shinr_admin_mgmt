import { MigrationInterface, QueryRunner } from "typeorm";

export class NewUserModel1760337439230 implements MigrationInterface {
    name = 'NewUserModel1760337439230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "userAddress" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "name" character varying, "addressLine1" character varying(255), "country" character varying(100), "city" character varying(100), "state" character varying(100), "pinCode" character varying(20), "latitude" numeric(10,5) NOT NULL, "longitude" numeric(10,5) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cc72457f081f2979232261c92a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b251cbfcbf880bcdec80cf36c" ON "userAddress" ("userId") `);
        await queryRunner.query(`ALTER TABLE "userAddress" ADD CONSTRAINT "FK_8b251cbfcbf880bcdec80cf36c5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userAddress" DROP CONSTRAINT "FK_8b251cbfcbf880bcdec80cf36c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b251cbfcbf880bcdec80cf36c"`);
        await queryRunner.query(`DROP TABLE "userAddress"`);
    }

}
