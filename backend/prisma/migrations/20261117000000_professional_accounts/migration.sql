CREATE TABLE "professional_accounts" (
    "id" SERIAL NOT NULL,
    "professionalId" INTEGER NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "professional_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "professional_accounts_professionalId_key" ON "professional_accounts"("professionalId");
ALTER TABLE "professional_accounts" ADD CONSTRAINT "professional_accounts_professionalId_fkey"
FOREIGN KEY ("professionalId") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
