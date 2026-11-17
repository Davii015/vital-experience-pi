const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { userScope, professionalScope, sessionScope, sensorScope, readingScope, reportScope } = require('../utils/access');

async function forUser(userId, actor) {
  const user = await prisma.user.findUnique({
    where: { id: userId, AND: [userScope(actor)] },
    include: {
      professional: true,
      reports: { where: reportScope(actor), orderBy: { createdAt: 'desc' } },
      sessions: { where: sessionScope(actor), orderBy: { startedAt: 'asc' }, include: { sensorData: { orderBy: { recordedAt: 'asc' } } } },
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

async function summary(actor) {
  const [users, professionals, activeSensors, sessions, sensorReadings] = await Promise.all([
    prisma.user.count({ where: userScope(actor) }),
    prisma.professional.count({ where: professionalScope(actor) }),
    prisma.sensor.count({ where: { status: 'ATIVO', ...sensorScope(actor) } }),
    prisma.session.count({ where: sessionScope(actor) }),
    prisma.sensorData.count({ where: readingScope(actor) }),
  ]);
  return { users, professionals, activeSensors, sessions, sensorReadings };
}

module.exports = { forUser, summary };
