import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionEnToProject1792313497498 implements MigrationInterface {
    name = 'AddDescriptionEnToProject1792313497498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" ADD "descriptionEn" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "descriptionEn"`);
    }

}
