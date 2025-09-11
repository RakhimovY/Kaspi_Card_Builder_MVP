-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lemonSqueezyCustomerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "customerId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsageStat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodYM" TEXT NOT NULL,
    "magicFillCount" INTEGER NOT NULL DEFAULT 0,
    "photosProcessed" INTEGER NOT NULL DEFAULT 0,
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "brand" TEXT,
    "type" TEXT,
    "model" TEXT,
    "keySpec" TEXT,
    "titleRU" TEXT,
    "titleKZ" TEXT,
    "descRU" TEXT,
    "descKZ" TEXT,
    "category" TEXT,
    "attributes" JSONB,
    "variantsJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "gtin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImageAsset" (
    "id" TEXT NOT NULL,
    "draftId" TEXT,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "hash" TEXT,
    "licenseNote" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BarcodeLookup" (
    "id" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "brand" TEXT,
    "name" TEXT,
    "model" TEXT,
    "rawJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarcodeLookup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImageProcessingLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalSize" INTEGER NOT NULL,
    "processedSize" INTEGER NOT NULL,
    "processingTime" INTEGER NOT NULL,
    "options" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageProcessingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IpQuota" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "periodYM" TEXT NOT NULL,
    "magicFillCount" INTEGER NOT NULL DEFAULT 0,
    "photosProcessed" INTEGER NOT NULL DEFAULT 0,
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_lemonSqueezyCustomerId_key" ON "public"."User"("lemonSqueezyCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Subscription_status_currentPeriodEnd_idx" ON "public"."Subscription"("status", "currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_provider_key" ON "public"."Subscription"("userId", "provider");

-- CreateIndex
CREATE INDEX "UsageStat_periodYM_idx" ON "public"."UsageStat"("periodYM");

-- CreateIndex
CREATE UNIQUE INDEX "UsageStat_userId_periodYM_key" ON "public"."UsageStat"("userId", "periodYM");

-- CreateIndex
CREATE INDEX "ProductDraft_userId_status_idx" ON "public"."ProductDraft"("userId", "status");

-- CreateIndex
CREATE INDEX "ProductDraft_gtin_idx" ON "public"."ProductDraft"("gtin");

-- CreateIndex
CREATE INDEX "ImageAsset_userId_idx" ON "public"."ImageAsset"("userId");

-- CreateIndex
CREATE INDEX "ImageAsset_hash_idx" ON "public"."ImageAsset"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "BarcodeLookup_gtin_key" ON "public"."BarcodeLookup"("gtin");

-- CreateIndex
CREATE INDEX "BarcodeLookup_gtin_idx" ON "public"."BarcodeLookup"("gtin");

-- CreateIndex
CREATE INDEX "ImageProcessingLog_userId_createdAt_idx" ON "public"."ImageProcessingLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImageProcessingLog_success_idx" ON "public"."ImageProcessingLog"("success");

-- CreateIndex
CREATE INDEX "IpQuota_periodYM_idx" ON "public"."IpQuota"("periodYM");

-- CreateIndex
CREATE INDEX "IpQuota_ipAddress_idx" ON "public"."IpQuota"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "IpQuota_ipAddress_periodYM_key" ON "public"."IpQuota"("ipAddress", "periodYM");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsageStat" ADD CONSTRAINT "UsageStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductDraft" ADD CONSTRAINT "ProductDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageAsset" ADD CONSTRAINT "ImageAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageAsset" ADD CONSTRAINT "ImageAsset_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."ProductDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageProcessingLog" ADD CONSTRAINT "ImageProcessingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
