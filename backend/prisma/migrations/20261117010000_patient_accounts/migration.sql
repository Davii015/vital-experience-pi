CREATE TABLE "patient_accounts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "patient_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "patient_accounts_userId_key" ON "patient_accounts"("userId");
CREATE UNIQUE INDEX "patient_accounts_email_key" ON "patient_accounts"("email");
ALTER TABLE "patient_accounts" ADD CONSTRAINT "patient_accounts_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
