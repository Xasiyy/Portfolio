import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompletedAtToProject1789728875796 implements MigrationInterface {
    name = 'AddCompletedAtToProject1789728875796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "completedAt" character varying(7)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "completedAt"`);
    }

}
