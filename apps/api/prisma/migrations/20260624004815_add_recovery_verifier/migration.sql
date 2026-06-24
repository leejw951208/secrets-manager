/*
  Warnings:

  - Added the required column `verifier` to the `RecoveryWrap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecoveryWrap" ADD COLUMN     "verifier" BYTEA NOT NULL;
