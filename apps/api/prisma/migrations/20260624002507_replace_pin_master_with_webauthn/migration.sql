/*
  Warnings:

  - You are about to drop the `PinCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VaultMaster` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PinCredential";

-- DropTable
DROP TABLE "VaultMaster";

-- CreateTable
CREATE TABLE "WebauthnCredential" (
    "id" TEXT NOT NULL,
    "credentialId" BYTEA NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "deviceType" TEXT,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "prfSalt" BYTEA NOT NULL,
    "wrappedVkPrf" BYTEA NOT NULL,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebauthnCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryWrap" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "rcSalt" BYTEA NOT NULL,
    "wrappedVkRc" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryWrap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebauthnCredential_credentialId_key" ON "WebauthnCredential"("credentialId");
