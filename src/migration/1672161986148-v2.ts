/*eslint max-len: ["error", {"ignorePattern": "^\\s*await queryRunner"}] */
/*eslint-disable quotes*/

import { MigrationInterface, QueryRunner } from "typeorm";

export class v21672161986148 implements MigrationInterface {
    name = 'v21672161986148';

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TABLE "v2_light" ("id" varchar PRIMARY KEY NOT NULL, "legacyId" varchar, "accessoryId" varchar NOT NULL, "deviceId" varchar NOT NULL, "name" varchar NOT NULL, "archetype" varchar NOT NULL, "currentOn" boolean, "currentBrightness" integer, "currentColorTemperature" integer, "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "brightnessControlled" boolean NOT NULL DEFAULT (0), "brightnessFactor" integer NOT NULL DEFAULT (100), "colorTemperatureControlled" boolean NOT NULL DEFAULT (0), "lastOn" boolean, "lastBrightness" integer, "lastColorTemperature" integer, "published" boolean NOT NULL DEFAULT (1), "brightnessCurveId" integer, "colorTemperatureCurveId" integer)`);
      await queryRunner.query(`CREATE TABLE "v2_group" ("id" varchar PRIMARY KEY NOT NULL, "legacyId" varchar, "accessoryId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "published" boolean NOT NULL DEFAULT (1))`);
      await queryRunner.query(`CREATE TABLE "v2_group_lights_v2_light" ("v2GroupId" varchar NOT NULL, "v2LightId" varchar NOT NULL, PRIMARY KEY ("v2GroupId", "v2LightId"))`);
      await queryRunner.query(`CREATE INDEX "IDX_c220b5740c83c93653607532a0" ON "v2_group_lights_v2_light" ("v2GroupId") `);
      await queryRunner.query(`CREATE INDEX "IDX_674f450954001bb044c8cd02a5" ON "v2_group_lights_v2_light" ("v2LightId") `);
      await queryRunner.query(`CREATE TABLE "temporary_light" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (''), "modelid" varchar NOT NULL DEFAULT (''), "manufacturername" varchar NOT NULL DEFAULT (''), "productname" varchar NOT NULL DEFAULT (''), "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "briControlled" boolean NOT NULL DEFAULT (0), "briMax" integer NOT NULL DEFAULT (254), "ctControlled" boolean NOT NULL DEFAULT (0), "smartoffOn" boolean, "smartoffBri" integer, "smartoffCt" integer, "smartoffActive" boolean NOT NULL DEFAULT (0), "published" boolean NOT NULL DEFAULT (1), "briCurveId" integer, "ctCurveId" integer, "isMigrated" boolean NOT NULL DEFAULT (0), CONSTRAINT "FK_308450fd2d790510e9dd1e35af4" FOREIGN KEY ("ctCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_6552939abdf66071405ed212063" FOREIGN KEY ("briCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
      await queryRunner.query(`INSERT INTO "temporary_light"("id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId") SELECT "id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId" FROM "light"`);
      await queryRunner.query(`DROP TABLE "light"`);
      await queryRunner.query(`ALTER TABLE "temporary_light" RENAME TO "light"`);
      await queryRunner.query(`CREATE TABLE "temporary_group" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (''), "published" boolean NOT NULL DEFAULT (1), "isMigrated" boolean NOT NULL DEFAULT (0))`);
      await queryRunner.query(`INSERT INTO "temporary_group"("id", "uniqueId", "name", "type", "published") SELECT "id", "uniqueId", "name", "type", "published" FROM "group"`);
      await queryRunner.query(`DROP TABLE "group"`);
      await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);
      await queryRunner.query(`CREATE TABLE "temporary_v2_light" ("id" varchar PRIMARY KEY NOT NULL, "legacyId" varchar, "accessoryId" varchar NOT NULL, "deviceId" varchar NOT NULL, "name" varchar NOT NULL, "archetype" varchar NOT NULL, "currentOn" boolean, "currentBrightness" integer, "currentColorTemperature" integer, "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "brightnessControlled" boolean NOT NULL DEFAULT (0), "brightnessFactor" integer NOT NULL DEFAULT (100), "colorTemperatureControlled" boolean NOT NULL DEFAULT (0), "lastOn" boolean, "lastBrightness" integer, "lastColorTemperature" integer, "published" boolean NOT NULL DEFAULT (1), "brightnessCurveId" integer, "colorTemperatureCurveId" integer, CONSTRAINT "FK_d1ca235a3fdc1cee0b86779072a" FOREIGN KEY ("brightnessCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_dd1c1631d2bd1015d6eb5e10487" FOREIGN KEY ("colorTemperatureCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
      await queryRunner.query(`INSERT INTO "temporary_v2_light"("id", "legacyId", "accessoryId", "deviceId", "name", "archetype", "currentOn", "currentBrightness", "currentColorTemperature", "on", "onControlled", "onThreshold", "brightnessControlled", "brightnessFactor", "colorTemperatureControlled", "lastOn", "lastBrightness", "lastColorTemperature", "published", "brightnessCurveId", "colorTemperatureCurveId") SELECT "id", "legacyId", "accessoryId", "deviceId", "name", "archetype", "currentOn", "currentBrightness", "currentColorTemperature", "on", "onControlled", "onThreshold", "brightnessControlled", "brightnessFactor", "colorTemperatureControlled", "lastOn", "lastBrightness", "lastColorTemperature", "published", "brightnessCurveId", "colorTemperatureCurveId" FROM "v2_light"`);
      await queryRunner.query(`DROP TABLE "v2_light"`);
      await queryRunner.query(`ALTER TABLE "temporary_v2_light" RENAME TO "v2_light"`);
      await queryRunner.query(`DROP INDEX "IDX_c220b5740c83c93653607532a0"`);
      await queryRunner.query(`DROP INDEX "IDX_674f450954001bb044c8cd02a5"`);
      await queryRunner.query(`CREATE TABLE "temporary_v2_group_lights_v2_light" ("v2GroupId" varchar NOT NULL, "v2LightId" varchar NOT NULL, CONSTRAINT "FK_c220b5740c83c93653607532a04" FOREIGN KEY ("v2GroupId") REFERENCES "v2_group" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_674f450954001bb044c8cd02a57" FOREIGN KEY ("v2LightId") REFERENCES "v2_light" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("v2GroupId", "v2LightId"))`);
      await queryRunner.query(`INSERT INTO "temporary_v2_group_lights_v2_light"("v2GroupId", "v2LightId") SELECT "v2GroupId", "v2LightId" FROM "v2_group_lights_v2_light"`);
      await queryRunner.query(`DROP TABLE "v2_group_lights_v2_light"`);
      await queryRunner.query(`ALTER TABLE "temporary_v2_group_lights_v2_light" RENAME TO "v2_group_lights_v2_light"`);
      await queryRunner.query(`CREATE INDEX "IDX_c220b5740c83c93653607532a0" ON "v2_group_lights_v2_light" ("v2GroupId") `);
      await queryRunner.query(`CREATE INDEX "IDX_674f450954001bb044c8cd02a5" ON "v2_group_lights_v2_light" ("v2LightId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP INDEX "IDX_674f450954001bb044c8cd02a5"`);
      await queryRunner.query(`DROP INDEX "IDX_c220b5740c83c93653607532a0"`);
      await queryRunner.query(`ALTER TABLE "v2_group_lights_v2_light" RENAME TO "temporary_v2_group_lights_v2_light"`);
      await queryRunner.query(`CREATE TABLE "v2_group_lights_v2_light" ("v2GroupId" varchar NOT NULL, "v2LightId" varchar NOT NULL, PRIMARY KEY ("v2GroupId", "v2LightId"))`);
      await queryRunner.query(`INSERT INTO "v2_group_lights_v2_light"("v2GroupId", "v2LightId") SELECT "v2GroupId", "v2LightId" FROM "temporary_v2_group_lights_v2_light"`);
      await queryRunner.query(`DROP TABLE "temporary_v2_group_lights_v2_light"`);
      await queryRunner.query(`CREATE INDEX "IDX_674f450954001bb044c8cd02a5" ON "v2_group_lights_v2_light" ("v2LightId") `);
      await queryRunner.query(`CREATE INDEX "IDX_c220b5740c83c93653607532a0" ON "v2_group_lights_v2_light" ("v2GroupId") `);
      await queryRunner.query(`ALTER TABLE "v2_light" RENAME TO "temporary_v2_light"`);
      await queryRunner.query(`CREATE TABLE "v2_light" ("id" varchar PRIMARY KEY NOT NULL, "legacyId" varchar, "accessoryId" varchar NOT NULL, "deviceId" varchar NOT NULL, "name" varchar NOT NULL, "archetype" varchar NOT NULL, "currentOn" boolean, "currentBrightness" integer, "currentColorTemperature" integer, "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "brightnessControlled" boolean NOT NULL DEFAULT (0), "brightnessFactor" integer NOT NULL DEFAULT (100), "colorTemperatureControlled" boolean NOT NULL DEFAULT (0), "lastOn" boolean, "lastBrightness" integer, "lastColorTemperature" integer, "published" boolean NOT NULL DEFAULT (1), "brightnessCurveId" integer, "colorTemperatureCurveId" integer)`);
      await queryRunner.query(`INSERT INTO "v2_light"("id", "legacyId", "accessoryId", "deviceId", "name", "archetype", "currentOn", "currentBrightness", "currentColorTemperature", "on", "onControlled", "onThreshold", "brightnessControlled", "brightnessFactor", "colorTemperatureControlled", "lastOn", "lastBrightness", "lastColorTemperature", "published", "brightnessCurveId", "colorTemperatureCurveId") SELECT "id", "legacyId", "accessoryId", "deviceId", "name", "archetype", "currentOn", "currentBrightness", "currentColorTemperature", "on", "onControlled", "onThreshold", "brightnessControlled", "brightnessFactor", "colorTemperatureControlled", "lastOn", "lastBrightness", "lastColorTemperature", "published", "brightnessCurveId", "colorTemperatureCurveId" FROM "temporary_v2_light"`);
      await queryRunner.query(`DROP TABLE "temporary_v2_light"`);
      await queryRunner.query(`ALTER TABLE "group" RENAME TO "temporary_group"`);
      await queryRunner.query(`CREATE TABLE "group" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (''), "published" boolean NOT NULL DEFAULT (1))`);
      await queryRunner.query(`INSERT INTO "group"("id", "uniqueId", "name", "type", "published") SELECT "id", "uniqueId", "name", "type", "published" FROM "temporary_group"`);
      await queryRunner.query(`DROP TABLE "temporary_group"`);
      await queryRunner.query(`ALTER TABLE "light" RENAME TO "temporary_light"`);
      await queryRunner.query(`CREATE TABLE "light" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (''), "modelid" varchar NOT NULL DEFAULT (''), "manufacturername" varchar NOT NULL DEFAULT (''), "productname" varchar NOT NULL DEFAULT (''), "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "briControlled" boolean NOT NULL DEFAULT (0), "briMax" integer NOT NULL DEFAULT (254), "ctControlled" boolean NOT NULL DEFAULT (0), "smartoffOn" boolean, "smartoffBri" integer, "smartoffCt" integer, "smartoffActive" boolean NOT NULL DEFAULT (0), "published" boolean NOT NULL DEFAULT (1), "briCurveId" integer, "ctCurveId" integer, CONSTRAINT "FK_308450fd2d790510e9dd1e35af4" FOREIGN KEY ("ctCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_6552939abdf66071405ed212063" FOREIGN KEY ("briCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
      await queryRunner.query(`INSERT INTO "light"("id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId") SELECT "id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId" FROM "temporary_light"`);
      await queryRunner.query(`DROP TABLE "temporary_light"`);
      await queryRunner.query(`DROP INDEX "IDX_674f450954001bb044c8cd02a5"`);
      await queryRunner.query(`DROP INDEX "IDX_c220b5740c83c93653607532a0"`);
      await queryRunner.query(`DROP TABLE "v2_group_lights_v2_light"`);
      await queryRunner.query(`DROP TABLE "v2_group"`);
      await queryRunner.query(`DROP TABLE "v2_light"`);
    }

}
