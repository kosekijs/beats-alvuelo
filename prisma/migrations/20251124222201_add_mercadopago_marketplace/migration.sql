/*
  Warnings:

  - A unique constraint covering the columns `[mercadopagoUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "marketplaceFee" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mercadopagoConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mercadopagoEmail" TEXT,
ADD COLUMN     "mercadopagoToken" TEXT,
ADD COLUMN     "mercadopagoUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mercadopagoUserId_key" ON "User"("mercadopagoUserId");
