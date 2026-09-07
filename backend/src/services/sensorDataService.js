const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { positiveInt, numberInRange, integerInRange, optionalString, enumValue, dateValue, requestValue } = require('../utils/validation');

function dataFrom(body) {
  return {
    sessionId: positiveInt(requestValue(body, 'sessionId', 'session_id'), 'sessionId'),
    sensorId: positiveInt(requestValue(body, 'sensorId', 'sensor_id'), 'sensorId', { optional: true }),
    heartRate: integerInRange(requestValue(body, 'heartRate', 'heart_rate'), 'heartRate', 20, 250),
    movementLevel: numberInRange(requestValue(body, 'movementLevel', 'movement'), 'movementLevel', 0, 100),
    effortLevel: optionalString(requestValue(body, 'effortLevel', 'effort_level')),
    fatigueRisk: enumValue(requestValue(body, 'fatigueRisk', 'fatigue_state'), 'fatigueRisk', ['BAIXO', 'MODERADO', 'ALTO']),
    bodyTemperature: numberInRange(requestValue(body, 'bodyTemperature', 'body_temperature'), 'bodyTemperature', 25, 45),
    oxygenLevel: numberInRange(requestValue(body, 'oxygenLevel', 'sp_o2'), 'oxygenLevel', 0, 100),
    steps: integerInRange(body.steps, 'steps', 0, 100000),
    recordedAt: dateValue(requestValue(body, 'recordedAt', 'recorded_at'), 'recordedAt', { optional: true }) || new Date(),
  };
}

async function list() {
  return prisma.sensorData.findMany({ orderBy: { recordedAt: 'desc' }, include: { sensor: true, session: true } });
}

async function bySession(sessionId) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, 'Sessão não encontrada');
  return prisma.sensorData.findMany({ where: { sessionId }, orderBy: { recordedAt: 'asc' }, include: { sensor: true } });
}

async function create(body) {
  const data = dataFrom(body);
  const session = await prisma.session.findUnique({ where: { id: data.sessionId } });
  if (!session) throw new ApiError(400, 'Sessão não encontrada');
  if (session.status === 'CANCELADA') throw new ApiError(409, 'Não é permitido registrar leitura em sessão cancelada');

  if (data.sensorId) {
    const sensor = await prisma.sensor.findUnique({ where: { id: data.sensorId } });
    if (!sensor) throw new ApiError(400, 'Sensor não encontrado');
    if (sensor.status !== 'ATIVO') throw new ApiError(409, 'O sensor informado está inativo');
    if (sensor.userId !== session.userId) throw new ApiError(409, 'O sensor não está vinculado ao usuário desta sessão');
  }

  return prisma.sensorData.create({ data, include: { sensor: true, session: true } });
}

async function remove(id) {
  const reading = await prisma.sensorData.findUnique({ where: { id } });
  if (!reading) throw new ApiError(404, 'Leitura não encontrada');
  await prisma.sensorData.delete({ where: { id } });
  return { message: 'Leitura removida' };
}

module.exports = { list, bySession, create, remove };
