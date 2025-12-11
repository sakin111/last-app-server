/*
  Warnings:

  - The values [FAMILY] on the enum `TravelType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TravelType_new" AS ENUM ('SOLO', 'GROUP', 'FRIENDS');
ALTER TABLE "travelPlan" ALTER COLUMN "travelType" TYPE "TravelType_new" USING ("travelType"::text::"TravelType_new");
ALTER TYPE "TravelType" RENAME TO "TravelType_old";
ALTER TYPE "TravelType_new" RENAME TO "TravelType";
DROP TYPE "public"."TravelType_old";
COMMIT;
