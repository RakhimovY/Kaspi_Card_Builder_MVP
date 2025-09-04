/*
  Warnings:

  - A unique constraint covering the columns `[lemonSqueezyCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "lemonSqueezyCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_lemonSqueezyCustomerId_key" ON "User"("lemonSqueezyCustomerId");
