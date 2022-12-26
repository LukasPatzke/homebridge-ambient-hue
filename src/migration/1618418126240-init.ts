/*eslint max-len: ["error", {"ignorePattern": "^\\s*await queryRunner"}] */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1618418126240 implements MigrationInterface {
  name = 'init1618418126240';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "point" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "first" boolean NOT NULL DEFAULT (0), "last" boolean NOT NULL DEFAULT (0), "curveId" integer)');
    await queryRunner.query('CREATE TABLE "curve" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "kind" varchar NOT NULL, "default" boolean NOT NULL DEFAULT (0))');
    await queryRunner.query('CREATE TABLE "position" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "position" integer NOT NULL DEFAULT (9999), "lightId" integer, "groupId" integer, CONSTRAINT "REL_fe3027c8acf525f8ad68d96c19" UNIQUE ("lightId"), CONSTRAINT "REL_f1610c596dc7116b51b311295f" UNIQUE ("groupId"))');
    await queryRunner.query('CREATE TABLE "light" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (\'\'), "modelid" varchar NOT NULL DEFAULT (\'\'), "manufacturername" varchar NOT NULL DEFAULT (\'\'), "productname" varchar NOT NULL DEFAULT (\'\'), "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "briControlled" boolean NOT NULL DEFAULT (0), "briMax" integer NOT NULL DEFAULT (254), "ctControlled" boolean NOT NULL DEFAULT (0), "smartoffOn" boolean, "smartoffBri" integer, "smartoffCt" integer, "smartoffActive" boolean NOT NULL DEFAULT (0), "published" boolean NOT NULL DEFAULT (1), "briCurveId" integer, "ctCurveId" integer)');
    await queryRunner.query('CREATE TABLE "group" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (\'\'), "published" boolean NOT NULL DEFAULT (1))');
    await queryRunner.query('CREATE TABLE "group_lights_light" ("groupId" integer NOT NULL, "lightId" integer NOT NULL, PRIMARY KEY ("groupId", "lightId"))');
    await queryRunner.query('CREATE INDEX "IDX_7c21e091796fdfa486f1d51448" ON "group_lights_light" ("groupId") ');
    await queryRunner.query('CREATE INDEX "IDX_9385904050a2c6781a2358f070" ON "group_lights_light" ("lightId") ');
    await queryRunner.query('CREATE TABLE "temporary_point" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "first" boolean NOT NULL DEFAULT (0), "last" boolean NOT NULL DEFAULT (0), "curveId" integer, CONSTRAINT "FK_b95e832f4f1f7c85df61c80259e" FOREIGN KEY ("curveId") REFERENCES "curve" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)');
    await queryRunner.query('INSERT INTO "temporary_point"("id", "x", "y", "first", "last", "curveId") SELECT "id", "x", "y", "first", "last", "curveId" FROM "point"');
    await queryRunner.query('DROP TABLE "point"');
    await queryRunner.query('ALTER TABLE "temporary_point" RENAME TO "point"');
    await queryRunner.query('CREATE TABLE "temporary_position" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "position" integer NOT NULL DEFAULT (9999), "lightId" integer, "groupId" integer, CONSTRAINT "REL_fe3027c8acf525f8ad68d96c19" UNIQUE ("lightId"), CONSTRAINT "REL_f1610c596dc7116b51b311295f" UNIQUE ("groupId"), CONSTRAINT "FK_fe3027c8acf525f8ad68d96c19d" FOREIGN KEY ("lightId") REFERENCES "light" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_f1610c596dc7116b51b311295f1" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)');
    await queryRunner.query('INSERT INTO "temporary_position"("id", "position", "lightId", "groupId") SELECT "id", "position", "lightId", "groupId" FROM "position"');
    await queryRunner.query('DROP TABLE "position"');
    await queryRunner.query('ALTER TABLE "temporary_position" RENAME TO "position"');
    await queryRunner.query('CREATE TABLE "temporary_light" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (\'\'), "modelid" varchar NOT NULL DEFAULT (\'\'), "manufacturername" varchar NOT NULL DEFAULT (\'\'), "productname" varchar NOT NULL DEFAULT (\'\'), "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "briControlled" boolean NOT NULL DEFAULT (0), "briMax" integer NOT NULL DEFAULT (254), "ctControlled" boolean NOT NULL DEFAULT (0), "smartoffOn" boolean, "smartoffBri" integer, "smartoffCt" integer, "smartoffActive" boolean NOT NULL DEFAULT (0), "published" boolean NOT NULL DEFAULT (1), "briCurveId" integer, "ctCurveId" integer, CONSTRAINT "FK_6552939abdf66071405ed212063" FOREIGN KEY ("briCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_308450fd2d790510e9dd1e35af4" FOREIGN KEY ("ctCurveId") REFERENCES "curve" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)');
    await queryRunner.query('INSERT INTO "temporary_light"("id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId") SELECT "id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId" FROM "light"');
    await queryRunner.query('DROP TABLE "light"');
    await queryRunner.query('ALTER TABLE "temporary_light" RENAME TO "light"');
    await queryRunner.query('DROP INDEX "IDX_7c21e091796fdfa486f1d51448"');
    await queryRunner.query('DROP INDEX "IDX_9385904050a2c6781a2358f070"');
    await queryRunner.query('CREATE TABLE "temporary_group_lights_light" ("groupId" integer NOT NULL, "lightId" integer NOT NULL, CONSTRAINT "FK_7c21e091796fdfa486f1d514489" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_9385904050a2c6781a2358f0702" FOREIGN KEY ("lightId") REFERENCES "light" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("groupId", "lightId"))');
    await queryRunner.query('INSERT INTO "temporary_group_lights_light"("groupId", "lightId") SELECT "groupId", "lightId" FROM "group_lights_light"');
    await queryRunner.query('DROP TABLE "group_lights_light"');
    await queryRunner.query('ALTER TABLE "temporary_group_lights_light" RENAME TO "group_lights_light"');
    await queryRunner.query('CREATE INDEX "IDX_7c21e091796fdfa486f1d51448" ON "group_lights_light" ("groupId") ');
    await queryRunner.query('CREATE INDEX "IDX_9385904050a2c6781a2358f070" ON "group_lights_light" ("lightId") ');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_9385904050a2c6781a2358f070"');
    await queryRunner.query('DROP INDEX "IDX_7c21e091796fdfa486f1d51448"');
    await queryRunner.query('ALTER TABLE "group_lights_light" RENAME TO "temporary_group_lights_light"');
    await queryRunner.query('CREATE TABLE "group_lights_light" ("groupId" integer NOT NULL, "lightId" integer NOT NULL, PRIMARY KEY ("groupId", "lightId"))');
    await queryRunner.query('INSERT INTO "group_lights_light"("groupId", "lightId") SELECT "groupId", "lightId" FROM "temporary_group_lights_light"');
    await queryRunner.query('DROP TABLE "temporary_group_lights_light"');
    await queryRunner.query('CREATE INDEX "IDX_9385904050a2c6781a2358f070" ON "group_lights_light" ("lightId") ');
    await queryRunner.query('CREATE INDEX "IDX_7c21e091796fdfa486f1d51448" ON "group_lights_light" ("groupId") ');
    await queryRunner.query('ALTER TABLE "light" RENAME TO "temporary_light"');
    await queryRunner.query('CREATE TABLE "light" ("id" integer PRIMARY KEY NOT NULL, "uniqueId" varchar NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL DEFAULT (\'\'), "modelid" varchar NOT NULL DEFAULT (\'\'), "manufacturername" varchar NOT NULL DEFAULT (\'\'), "productname" varchar NOT NULL DEFAULT (\'\'), "on" boolean NOT NULL DEFAULT (0), "onControlled" boolean NOT NULL DEFAULT (0), "onThreshold" integer NOT NULL DEFAULT (0), "briControlled" boolean NOT NULL DEFAULT (0), "briMax" integer NOT NULL DEFAULT (254), "ctControlled" boolean NOT NULL DEFAULT (0), "smartoffOn" boolean, "smartoffBri" integer, "smartoffCt" integer, "smartoffActive" boolean NOT NULL DEFAULT (0), "published" boolean NOT NULL DEFAULT (1), "briCurveId" integer, "ctCurveId" integer)');
    await queryRunner.query('INSERT INTO "light"("id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId") SELECT "id", "uniqueId", "name", "type", "modelid", "manufacturername", "productname", "on", "onControlled", "onThreshold", "briControlled", "briMax", "ctControlled", "smartoffOn", "smartoffBri", "smartoffCt", "smartoffActive", "published", "briCurveId", "ctCurveId" FROM "temporary_light"');
    await queryRunner.query('DROP TABLE "temporary_light"');
    await queryRunner.query('ALTER TABLE "position" RENAME TO "temporary_position"');
    await queryRunner.query('CREATE TABLE "position" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "position" integer NOT NULL DEFAULT (9999), "lightId" integer, "groupId" integer, CONSTRAINT "REL_fe3027c8acf525f8ad68d96c19" UNIQUE ("lightId"), CONSTRAINT "REL_f1610c596dc7116b51b311295f" UNIQUE ("groupId"))');
    await queryRunner.query('INSERT INTO "position"("id", "position", "lightId", "groupId") SELECT "id", "position", "lightId", "groupId" FROM "temporary_position"');
    await queryRunner.query('DROP TABLE "temporary_position"');
    await queryRunner.query('ALTER TABLE "point" RENAME TO "temporary_point"');
    await queryRunner.query('CREATE TABLE "point" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "first" boolean NOT NULL DEFAULT (0), "last" boolean NOT NULL DEFAULT (0), "curveId" integer)');
    await queryRunner.query('INSERT INTO "point"("id", "x", "y", "first", "last", "curveId") SELECT "id", "x", "y", "first", "last", "curveId" FROM "temporary_point"');
    await queryRunner.query('DROP TABLE "temporary_point"');
    await queryRunner.query('DROP INDEX "IDX_9385904050a2c6781a2358f070"');
    await queryRunner.query('DROP INDEX "IDX_7c21e091796fdfa486f1d51448"');
    await queryRunner.query('DROP TABLE "group_lights_light"');
    await queryRunner.query('DROP TABLE "group"');
    await queryRunner.query('DROP TABLE "light"');
    await queryRunner.query('DROP TABLE "position"');
    await queryRunner.query('DROP TABLE "curve"');
    await queryRunner.query('DROP TABLE "point"');
  }
}
