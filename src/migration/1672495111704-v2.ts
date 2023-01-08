/*eslint-disable max-len */
/*eslint-disable quotes*/

import { MigrationInterface, QueryRunner } from 'typeorm';

export class v21672495111704 implements MigrationInterface {
  name = 'v21672495111704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "position"`);
    await queryRunner.query(
      `CREATE TABLE "color_temperature_curve" ( "id" integer PRIMARY KEY NOT NULL, "name" varchar NOT NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "color_temperature_curve" ("id", "name") SELECT CASE WHEN "default" = 1 THEN 0 ELSE "id" END "id", "name" FROM "curve" WHERE "kind" = 'ct'`,
    );
    await queryRunner.query(
      `CREATE TABLE "brightness_curve" ( "id" integer PRIMARY KEY NOT NULL, "name" varchar NOT NULL )`,
    );
    await queryRunner.query(
      `INSERT INTO "brightness_curve" ("id", "name") SELECT CASE WHEN "default" = 1 THEN 0 ELSE "id" END "id", "name" FROM "curve" WHERE "kind" = 'bri'`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_point" ( "id" integer PRIMARY KEY NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "first" boolean NOT NULL DEFAULT (0), "last" boolean NOT NULL DEFAULT (0), "brightnessCurveId" integer, "colorTemperatureCurveId" integer, CONSTRAINT "FK_cf40eb23a4fe8fc9db6d9d1d308" FOREIGN KEY ("brightnessCurveId") REFERENCES "brightness_curve" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_66c52cb95edf6c3b7f0a5fa2330" FOREIGN KEY ("colorTemperatureCurveId") REFERENCES "color_temperature_curve" ("id") ON DELETE CASCADE ON UPDATE NO ACTION )`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_point"( "id", "x", "y", "first", "last", "brightnessCurveId", "colorTemperatureCurveId" ) SELECT "point"."id", "x", CASE WHEN "curve"."kind" = 'bri' THEN CAST("y"/2.54 as int) ELSE "y" END, "first", "last", CASE WHEN "curve"."kind" = 'bri' THEN CASE WHEN "curve"."default" = 1 THEN 0 ELSE "curveId" END ELSE NULL END "brightnessCurveId", CASE WHEN "curve"."kind" = 'ct' THEN CASE WHEN "curve"."default" = 1 THEN 0 ELSE "curveId" END ELSE NULL END "colorTemperatureCurveId" FROM "point" INNER JOIN "curve" ON "point"."curveId" = "curve"."id"`,
    );
    await queryRunner.query(`DROP TABLE "point"`);
    await queryRunner.query(`ALTER TABLE "temporary_point" RENAME TO "point"`);
    await queryRunner.query(
      'CREATE TABLE "temporary_group_lights_light" ("groupId" integer NOT NULL, "lightId" integer NOT NULL)',
    );
    await queryRunner.query(
      'INSERT INTO "temporary_group_lights_light"("groupId", "lightId") SELECT "groupId", "lightId" FROM "group_lights_light"',
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_light" ( "id" integer PRIMARY KEY NOT NULL, "hueId" varchar, "legacyId" varchar, "accessoryId" varchar NOT NULL, "deviceId" varchar, "name" varchar NOT NULL, "archetype" varchar NOT NULL, "currentOn" boolean, "currentBrightness" integer, "currentColorTemperature" integer, "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "brightnessControlled" boolean NOT NULL DEFAULT (0), "brightnessFactor" integer NOT NULL DEFAULT (100), "colorTemperatureControlled" boolean NOT NULL DEFAULT (0), "lastOn" boolean, "lastBrightness" integer, "lastColorTemperature" integer, "published" boolean NOT NULL DEFAULT (1), "brightnessCurveId" integer NOT NULL DEFAULT (0), "colorTemperatureCurveId" integer NOT NULL DEFAULT (0), "isBrightnessCapable" boolean NOT NULL DEFAULT (0), "isColorTemperatureCapable" integer NOT NULL DEFAULT (0), CONSTRAINT "FK_d1ca235a3fdc1cee0b86779072a" FOREIGN KEY ("brightnessCurveId") REFERENCES "brightness_curve" ("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION, CONSTRAINT "FK_dd1c1631d2bd1015d6eb5e10487" FOREIGN KEY ("colorTemperatureCurveId") REFERENCES "color_temperature_curve" ("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION )`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_light" ( "id", "legacyId", "accessoryId", "name", "archetype", "on", "onControlled", "onThreshold", "brightnessControlled", "brightnessFactor", "colorTemperatureControlled", "published", "brightnessCurveId", "colorTemperatureCurveId" ) SELECT "id", '/lights/' || "id", "uniqueId", "name", '', "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "published", IFNULL("briCurveId", 0), IFNULL("ctCurveId", 0) FROM "light"`,
    );
    await queryRunner.query(`DROP TABLE "light"`);
    await queryRunner.query(`ALTER TABLE "temporary_light" RENAME TO "light"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_group" ( "id" integer PRIMARY KEY NOT NULL, "hueId" varchar, "legacyId" varchar, "accessoryId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "published" boolean NOT NULL DEFAULT (1) )`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group" ( "id", "legacyId", "accessoryId", "name", "type", "published" ) SELECT "id", '/groups/' || "id", "uniqueId", "name", LOWER("type"), "published" FROM "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE "temporary_group" RENAME TO "group"`);
    await queryRunner.query(
      'INSERT INTO "group_lights_light"("groupId", "lightId") SELECT "groupId", "lightId" FROM "temporary_group_lights_light"',
    );
    await queryRunner.query(`DROP TABLE "temporary_group_lights_light"`);
    await queryRunner.query(`DROP TABLE "curve"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "curve" (  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,  "temporary_id" integer,  "name" varchar NOT NULL,  "kind" varchar NOT NULL,  "default" boolean NOT NULL DEFAULT (0) )`,
    );
    await queryRunner.query(
      `INSERT INTO  "curve" ("temporary_id", "name", "kind", "default") SELECT  "id",  "name",  'bri',  CASE  WHEN "id" = 0 THEN 1  ELSE 0  END FROM  "brightness_curve"`,
    );
    await queryRunner.query(
      `INSERT INTO  "curve" ("temporary_id", "name", "kind", "default") SELECT  "id",  "name",  'ct',  CASE  WHEN "id" = 0 THEN 1  ELSE 0  END FROM  "color_temperature_curve"`,
    );
    await queryRunner.query(`DROP TABLE "brightness_curve"`);
    await queryRunner.query(`DROP TABLE "color_temperature_curve"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_group" (  "id" integer PRIMARY KEY NOT NULL,  "uniqueId" varchar NOT NULL,  "name" varchar NOT NULL,  "type" varchar NOT NULL DEFAULT (''),  "published" boolean NOT NULL DEFAULT (1) )`,
    );
    await queryRunner.query(
      `INSERT INTO  "temporary_group" (  "id",  "uniqueId",  "name",  "type",  "published"  ) SELECT  "id",  "accessoryId",  "name",  CASE  WHEN "type" = 'room' THEN 'Room'  ELSE 'Zone'  END,  "published" FROM  "group"`,
    );
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`ALTER TABLE  "temporary_group" RENAME TO "group"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_light" (  "id" integer PRIMARY KEY NOT NULL,  "uniqueId" varchar NOT NULL,  "name" varchar NOT NULL,  "type" varchar NOT NULL DEFAULT (''),  "modelid" varchar NOT NULL DEFAULT (''),  "manufacturername" varchar NOT NULL DEFAULT (''),  "productname" varchar NOT NULL DEFAULT (''),  "on" boolean NOT NULL DEFAULT (0),  "onControlled" boolean NOT NULL DEFAULT (0),  "onThreshold" integer NOT NULL DEFAULT (0),  "briControlled" boolean NOT NULL DEFAULT (0),  "briMax" integer NOT NULL DEFAULT (254),  "ctControlled" boolean NOT NULL DEFAULT (0),  "smartoffOn" boolean,  "smartoffBri" integer,  "smartoffCt" integer,  "smartoffActive" boolean NOT NULL DEFAULT (0),  "published" boolean NOT NULL DEFAULT (1),  "briCurveId" integer,  "ctCurveId" integer,  CONSTRAINT "FK_6552939abdf66071405ed212063" FOREIGN KEY ("briCurveId") REFERENCES "curve" ("id") ON DELETE  SET  NULL ON UPDATE NO ACTION,  CONSTRAINT "FK_308450fd2d790510e9dd1e35af4" FOREIGN KEY ("ctCurveId") REFERENCES "curve" ("id") ON DELETE  SET  NULL ON UPDATE NO ACTION )`,
    );
    await queryRunner.query(
      `INSERT INTO  "temporary_light" (  "id",  "uniqueId",  "name",  "on",  "onControlled",  "onThreshold",  "briControlled",  "briMax",  "ctControlled",  "published",  "briCurveId",  "ctCurveId"  ) SELECT  "light"."id",  "uniqueId",  "light"."name",  "on",  "onControlled",  "onThreshold",  "brightnessControlled",  "brightnessFactor",  "colorTemperatureControlled",  "published",  "briCurve"."id",  "ctCurve"."id" FROM  "light"  INNER JOIN "curve" as "briCurve" ON "light"."brightnessCurveId" = "briCurve"."temporary_id"  AND "briCurve"."kind" = 'bri'  INNER JOIN "curve" as "ctCurve" ON "light"."colorTemperatureCurveId" = "ctCurve"."temporary_id"  AND "ctCurve"."kind" = 'ct'`,
    );
    await queryRunner.query(`DROP TABLE "light"`);
    await queryRunner.query(`ALTER TABLE  "temporary_light" RENAME TO "light"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_point" (  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,  "x" integer NOT NULL,  "y" integer NOT NULL,  "first" boolean NOT NULL DEFAULT (0),  "last" boolean NOT NULL DEFAULT (0),  "curveId" integer,  CONSTRAINT "FK_b95e832f4f1f7c85df61c80259e" FOREIGN KEY ("curveId") REFERENCES "curve" ("id") ON DELETE CASCADE ON UPDATE NO ACTION )`,
    );
    await queryRunner.query(
      `INSERT INTO  "temporary_point"(  "id",  "x",  "y",  "first",  "last",  "curveId"  ) SELECT  "point"."id",  "x",  CASE WHEN "briCurve"."id" IS NULL THEN "y" ELSE CAST("y"*2.54 as INT),  "first",  "last",  IFNULL("briCurve"."id", "ctCurve"."id") FROM  "point"  LEFT JOIN "curve" as "briCurve" ON "point"."brightnessCurveId" = "briCurve"."temporary_id"  AND "briCurve"."kind" = 'bri'  LEFT JOIN "curve" as "ctCurve" ON "point"."colorTemperatureCurveId" = "ctCurve"."temporary_id"  AND "ctCurve"."kind" = 'ct'`,
    );
    await queryRunner.query(`DROP TABLE "point"`);
    await queryRunner.query(`ALTER TABLE  "temporary_point" RENAME TO "point"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_curve" (  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,  "name" varchar NOT NULL,  "kind" varchar NOT NULL,  "default" boolean NOT NULL DEFAULT (0) )`,
    );
    await queryRunner.query(
      `INSERT INTO  "temporary_curve" ("id", "name", "kind", "default") SELECT  "id",  "name",  "kind",  "default" FROM  "curve"`,
    );
    await queryRunner.query(`DROP TABLE "curve"`);
    await queryRunner.query(`ALTER TABLE  "temporary_curve" RENAME TO "curve"`);
    await queryRunner.query(
      `CREATE TABLE "position" (  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,  "position" integer NOT NULL DEFAULT (9999),  "lightId" integer,  "groupId" integer,  CONSTRAINT "REL_fe3027c8acf525f8ad68d96c19" UNIQUE ("lightId"),  CONSTRAINT "REL_f1610c596dc7116b51b311295f" UNIQUE ("groupId"),  CONSTRAINT "FK_fe3027c8acf525f8ad68d96c19d" FOREIGN KEY ("lightId") REFERENCES "light" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,  CONSTRAINT "FK_f1610c596dc7116b51b311295f1" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE NO ACTION )`,
    );
    await queryRunner.query(
      `INSERT INTO  "position" ("lightId") SELECT  "id" FROM  "light"`,
    );
    await queryRunner.query(
      `INSERT INTO  "position" ("groupId") SELECT  "id" FROM  "group"`,
    );
  }
}
