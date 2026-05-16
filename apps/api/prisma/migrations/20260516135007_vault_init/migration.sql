-- CreateTable
CREATE TABLE "VaultMaster" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "kdfVersion" INTEGER NOT NULL DEFAULT 1,
    "kdfAlgorithm" TEXT NOT NULL DEFAULT 'argon2id',
    "kdfMemoryKiB" INTEGER NOT NULL DEFAULT 65536,
    "kdfIterations" INTEGER NOT NULL DEFAULT 3,
    "kdfParallelism" INTEGER NOT NULL DEFAULT 1,
    "salt" BLOB NOT NULL,
    "verifyIv" BLOB NOT NULL,
    "verifyCiphertext" BLOB NOT NULL,
    "verifyAuthTag" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VaultEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "iv" BLOB NOT NULL,
    "ciphertext" BLOB NOT NULL,
    "authTag" BLOB NOT NULL,
    "kdfVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "VaultEntry_category_idx" ON "VaultEntry"("category");

-- CreateIndex
CREATE INDEX "VaultEntry_label_idx" ON "VaultEntry"("label");

-- CreateIndex
CREATE UNIQUE INDEX "VaultEntry_category_label_key" ON "VaultEntry"("category", "label");
