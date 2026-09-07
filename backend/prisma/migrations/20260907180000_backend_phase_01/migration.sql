-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
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
