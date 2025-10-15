import { MigrationInterface, QueryRunner } from "typeorm";

export class UserModels1759660288372 implements MigrationInterface {
    name = 'UserModels1759660288372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "email" character varying, "mobile" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "lastActive" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_d376a9f93bba651f32a2c03a7d3" UNIQUE ("mobile"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_951b8f1dfc94ac1d0301a14b7e" ON "users" ("uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_d376a9f93bba651f32a2c03a7d" ON "users" ("mobile") `);
        await queryRunner.query(`CREATE TABLE "userDevice" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "lastLogin" TIMESTAMP, "lastActive" TIMESTAMP, "userAgent" character varying, "lastLogoutTime" TIMESTAMP, "ipAddress" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d9d56d85466ed4356ea156d5cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6b195c4ce27d73366cef2c4b54" ON "userDevice" ("uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_9f3c9ae281195c7c59cb694980" ON "userDevice" ("userId") `);
        await queryRunner.query(`CREATE TABLE "userOtp" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "deviceId" integer NOT NULL, "otp" character varying NOT NULL, "otpToken" character varying NOT NULL, "lastRequestedTime" TIMESTAMP NOT NULL, "requestCount" smallint NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e53e492972b6a7f3fd97e34eac8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f9005f69a93cc20f32bd0ce114" ON "userOtp" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dbe33a676c9935082befb09f69" ON "userOtp" ("deviceId") `);
        await queryRunner.query(`CREATE TABLE "userToken" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "deviceId" integer NOT NULL, "refreshToken" text NOT NULL, "accessToken" character varying NOT NULL, "refreshTokenExpiry" TIMESTAMP, "refreshTokenStatus" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57e9636d5325549fd42e0d7a440" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_002c4d6b032daf6b513e1a4cd8" ON "userToken" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ed220e4533fb012a59ce1bd7f5" ON "userToken" ("deviceId") `);
        await queryRunner.query(`ALTER TABLE "userDevice" ADD CONSTRAINT "FK_9f3c9ae281195c7c59cb694980a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "userOtp" ADD CONSTRAINT "FK_f9005f69a93cc20f32bd0ce1145" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "userOtp" ADD CONSTRAINT "FK_dbe33a676c9935082befb09f695" FOREIGN KEY ("deviceId") REFERENCES "userDevice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "userToken" ADD CONSTRAINT "FK_002c4d6b032daf6b513e1a4cd8f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userToken" DROP CONSTRAINT "FK_002c4d6b032daf6b513e1a4cd8f"`);
        await queryRunner.query(`ALTER TABLE "userOtp" DROP CONSTRAINT "FK_dbe33a676c9935082befb09f695"`);
        await queryRunner.query(`ALTER TABLE "userOtp" DROP CONSTRAINT "FK_f9005f69a93cc20f32bd0ce1145"`);
        await queryRunner.query(`ALTER TABLE "userDevice" DROP CONSTRAINT "FK_9f3c9ae281195c7c59cb694980a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ed220e4533fb012a59ce1bd7f5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_002c4d6b032daf6b513e1a4cd8"`);
        await queryRunner.query(`DROP TABLE "userToken"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dbe33a676c9935082befb09f69"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9005f69a93cc20f32bd0ce114"`);
        await queryRunner.query(`DROP TABLE "userOtp"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9f3c9ae281195c7c59cb694980"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b195c4ce27d73366cef2c4b54"`);
        await queryRunner.query(`DROP TABLE "userDevice"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d376a9f93bba651f32a2c03a7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_951b8f1dfc94ac1d0301a14b7e"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
