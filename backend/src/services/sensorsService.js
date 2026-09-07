const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { requiredString, optionalString, positiveInt, integerInRange, dateValue, enumValue, requestValue } = require('../utils/validation');

async function ensureUser(id) {
  if (!id) return;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(400, 'Usuário monitorado não encontrado');
  if (user.status !== 'ATIVO') throw new ApiError(409, 'O sensor não pode ser vinculado a um usuário inativo');
}

function dataFrom(body, partial = false) {
  const userId = requestValue(body, 'userId', 'user_id');
  const serialNumber = requestValue(body, 'serialNumber', 'serial_number');
  const batteryLevel = requestValue(body, 'batteryLevel', 'battery_level');
  const lastSync = requestValue(body, 'lastSync', 'last_sync');
  const data = {};
  if (!partial || body.name !== undefined || body.model !== undefined) data.name = requiredString(body.name ?? body.model, 'name');
  if (!partial || body.type !== undefined) data.type = requiredString(body.type, 'type');
  if (serialNumber !== undefined) data.serialNumber = optionalString(serialNumber);
  if (body.status !== undefined) data.status = enumValue(body.status, 'status', ['ATIVO', 'INATIVO'], { optional: false });
  if (batteryLevel !== undefined) data.batteryLevel = integerInRange(batteryLevel, 'batteryLevel', 0, 100);
  if (lastSync !== undefined) data.lastSync = dateValue(lastSync, 'lastSync', { optional: true });
  if (userId !== undefined) data.userId = positiveInt(userId, 'userId', { optional: true });
  return data;
}

async function list() {
  return prisma.sensor.findMany({ orderBy: { id: 'asc' }, include: { user: true } });
}

async function get(id) {
  const sensor = await prisma.sensor.findUnique({ where: { id }, include: { user: true } });
  if (!sensor) throw new ApiError(404, 'Sensor não encontrado');
  return sensor;
}

async function create(body) {
  const data = dataFrom(body);
  await ensureUser(data.userId);
  return prisma.sensor.create({ data, include: { user: true } });
}

async function update(id, body) {
  await get(id);
  const data = dataFrom(body, true);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nenhum campo válido foi informado');
  if ('userId' in data) await ensureUser(data.userId);
  return prisma.sensor.update({ where: { id }, data, include: { user: true } });
}

async function remove(id) {
  await get(id);
  await prisma.sensor.delete({ where: { id } });
  return { message: 'Sensor removido' };
}

module.exports = { list, get, create, update, remove };
