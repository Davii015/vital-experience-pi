const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');

async function forUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      professional: true,
      reports: { orderBy: { createdAt: 'desc' } },
      sessions: { orderBy: { startedAt: 'asc' }, include: { sensorData: { orderBy: { recordedAt: 'asc' } } } },
    },
  });
  if (!user) throw new ApiError(404, 'Usuário não encontrado');

  const readings = user.sessions.flatMap((session) => session.sensorData);
  const heartRates = readings.map((reading) => reading.heartRate).filter(Number.isFinite);
  const distribution = (field) => readings.reduce((result, reading) => {
    const value = reading[field];
    if (value) result[value] = (result[value] || 0) + 1;
    return result;
  }, {});

  return {
    user: { ...user, sessions: undefined, reports: undefined },
    totalSessions: user.sessions.length,
    completedSessions: user.sessions.filter((session) => session.status === 'FINALIZADA').length,
    totalReadings: readings.length,
    avgHeartRate: heartRates.length ? Math.round(heartRates.reduce((sum, value) => sum + value, 0) / heartRates.length) : null,
    effortDistribution: distribution('effortLevel'),
    fatigueDistribution: distribution('fatigueRisk'),
    reports: user.reports,
    sessions: user.sessions,
  };
}

async function summary() {
  const [users, professionals, activeSensors, sessions, sensorReadings] = await Promise.all([
    prisma.user.count(),
    prisma.professional.count(),
    prisma.sensor.count({ where: { status: 'ATIVO' } }),
    prisma.session.count(),
    prisma.sensorData.count(),
  ]);
  return { users, professionals, activeSensors, sessions, sensorReadings };
}

module.exports = { forUser, summary };
