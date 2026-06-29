-- 싱글톤 수입은 구조(month 없음, 블롭 {amount})가 비호환이라 폐기한다.
DELETE FROM "Income";

/*
  Warnings:

  - Added the required column `month` to the `Income` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "month" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Income_month_idx" ON "Income"("month");
