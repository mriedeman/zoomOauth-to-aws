import { MigrationInterface, QueryRunner } from "typeorm";

export class ScaffoldawsTables1695930107355 implements MigrationInterface {
    name = 'ScaffoldawsTables1695930107355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "aws_transaction_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "video_name" character varying NOT NULL, "date_stored" TIMESTAMP NOT NULL DEFAULT now(), "video_storage_url" character varying, "transcript_storage_url" character varying, "video_summary" character varying, "manual_edit" boolean DEFAULT false, CONSTRAINT "PK_4f827661cf8c89b6308c818763f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "aws_transaction_log"`);
    }

}
