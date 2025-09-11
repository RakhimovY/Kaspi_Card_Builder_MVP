-- AlterTable
ALTER TABLE "public"."ImageProcessingLog" ADD COLUMN     "ipAddress" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ImageProcessingLog_ipAddress_createdAt_idx" ON "public"."ImageProcessingLog"("ipAddress", "createdAt");
