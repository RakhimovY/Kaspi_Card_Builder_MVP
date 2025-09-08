-- CreateTable
CREATE TABLE "ImageProcessingLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalSize" INTEGER NOT NULL,
    "processedSize" INTEGER NOT NULL,
    "processingTime" INTEGER NOT NULL,
    "options" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImageProcessingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ImageProcessingLog_userId_createdAt_idx" ON "ImageProcessingLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImageProcessingLog_success_idx" ON "ImageProcessingLog"("success");
