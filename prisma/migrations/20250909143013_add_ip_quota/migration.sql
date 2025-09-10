-- CreateTable
CREATE TABLE "IpQuota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipAddress" TEXT NOT NULL,
    "periodYM" TEXT NOT NULL,
    "magicFillCount" INTEGER NOT NULL DEFAULT 0,
    "photosProcessed" INTEGER NOT NULL DEFAULT 0,
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "IpQuota_periodYM_idx" ON "IpQuota"("periodYM");

-- CreateIndex
CREATE INDEX "IpQuota_ipAddress_idx" ON "IpQuota"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "IpQuota_ipAddress_periodYM_key" ON "IpQuota"("ipAddress", "periodYM");
