-- Vital Experience - referência SQL do modelo Prisma
-- A fonte oficial é backend/prisma/schema.prisma e as migrations em backend/prisma/migrations.

CREATE TYPE "Status" AS ENUM ('ATIVO', 'INATIVO');
CREATE TYPE "SessionStatus" AS ENUM ('EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA');
CREATE TYPE "FatigueRisk" AS ENUM ('BAIXO', 'MODERADO', 'ALTO');
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO');

CREATE TABLE "admins" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "professionals" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "specialty" TEXT,
  "registrationNumber" TEXT,
  "status" "Status" NOT NULL DEFAULT 'ATIVO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "professionalId" INTEGER REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "birthDate" TIMESTAMP(3),
  "gender" "Gender",
  "conditionDescription" TEXT,
  "status" "Status" NOT NULL DEFAULT 'ATIVO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "sensors" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "serialNumber" TEXT UNIQUE,
  "status" "Status" NOT NULL DEFAULT 'ATIVO',
  "batteryLevel" INTEGER,
  "lastSync" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "sessions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "professionalId" INTEGER REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "title" TEXT,
  "sessionType" TEXT NOT NULL,
  "notes" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "endedAt" TIMESTAMP(3),
  "status" "SessionStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "sensor_data" (
  "id" SERIAL PRIMARY KEY,
  "sessionId" INTEGER NOT NULL REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "sensorId" INTEGER REFERENCES "sensors"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "heartRate" INTEGER,
  "movementLevel" DOUBLE PRECISION,
  "effortLevel" TEXT,
  "fatigueRisk" "FatigueRisk",
  "bodyTemperature" DOUBLE PRECISION,
  "oxygenLevel" DOUBLE PRECISION,
  "steps" INTEGER,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "reports" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "professionalId" INTEGER REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "evolutionStatus" TEXT,
  "recommendation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "professionals_status_idx" ON "professionals"("status");
CREATE INDEX "users_professionalId_idx" ON "users"("professionalId");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "sensors_userId_idx" ON "sensors"("userId");
CREATE INDEX "sensors_status_idx" ON "sensors"("status");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_professionalId_idx" ON "sessions"("professionalId");
CREATE INDEX "sessions_startedAt_idx" ON "sessions"("startedAt");
CREATE INDEX "sessions_status_idx" ON "sessions"("status");
CREATE INDEX "sensor_data_sessionId_idx" ON "sensor_data"("sessionId");
CREATE INDEX "sensor_data_sensorId_idx" ON "sensor_data"("sensorId");
CREATE INDEX "sensor_data_recordedAt_idx" ON "sensor_data"("recordedAt");
CREATE INDEX "reports_userId_idx" ON "reports"("userId");
CREATE INDEX "reports_professionalId_idx" ON "reports"("professionalId");
