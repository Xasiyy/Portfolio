import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToContact1790343876179 implements MigrationInterface {
    name = 'AddNameToContact1790343876179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact" ADD "firstName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contact" ADD "lastName" character varying(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "contact" DROP COLUMN "firstName"`);
    }

}
