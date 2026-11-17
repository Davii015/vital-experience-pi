const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { isProfessional, userScope, sessionScope } = require('../utils/access');
const { requiredString, optionalString, positiveInt, dateValue, enumValue, requestValue } = require('../utils/validation');

async function ensureActive(model, id, label) {
  if (!id) return;
  const record = await prisma[model].findUnique({ where: { id } });
  if (!record) throw new ApiError(400, `${label} não encontrado`);
  if (record.status !== 'ATIVO') throw new ApiError(409, `${label} está inativo`);
}

function dataFrom(body, partial = false) {
  const userId = requestValue(body, 'userId', 'user_id');
  const professionalId = requestValue(body, 'professionalId', 'professional_id');
  const sessionType = requestValue(body, 'sessionType', 'type');
  const startedAt = requestValue(body, 'startedAt', 'start_time');
  const endedAt = requestValue(body, 'endedAt', 'end_time');
  const data = {};
  if (!partial || userId !== undefined) data.userId = positiveInt(userId, 'userId');
  if (professionalId !== undefined) data.professionalId = positiveInt(professionalId, 'professionalId', { optional: true });
  if (!partial || sessionType !== undefined) data.sessionType = requiredString(sessionType, 'sessionType');
  if (body.title !== undefined) data.title = optionalString(body.title);
  if (body.notes !== undefined) data.notes = optionalString(body.notes);
  if (!partial || startedAt !== undefined) data.startedAt = dateValue(startedAt, 'startedAt');
  if (endedAt !== undefined) data.endedAt = dateValue(endedAt, 'endedAt', { optional: true });
  if (body.status !== undefined) data.status = enumValue(body.status, 'status', ['EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA'], { optional: false });
  return data;
}

function validateDates(data, current = {}) {
  const start = data.startedAt ?? current.startedAt;
  const end = data.endedAt === undefined ? current.endedAt : data.endedAt;
  const status = data.status ?? current.status;
  if (end && start && end < start) throw new ApiError(400, 'endedAt não pode ser anterior a startedAt');
  if (status === 'FINALIZADA' && !end) throw new ApiError(400, 'Uma sessão finalizada deve informar endedAt');
}

const include = { user: true, professional: true, _count: { select: { sensorData: true } } };

async function list(actor) {
  return prisma.session.findMany({ where: sessionScope(actor), orderBy: { startedAt: 'desc' }, include });
}

async function get(id, actor) {
  const session = await prisma.session.findUnique({ where: { id, ...sessionScope(actor) }, include: { user: true, professional: true, sensorData: { orderBy: { recordedAt: 'asc' } } } });
  if (!session) throw new ApiError(404, 'Sessão não encontrada');
  return session;
}

async function restrictAssignment(data, actor, current = {}) {
  if (!isProfessional(actor)) return;
  if ('professionalId' in data && data.professionalId !== actor.professionalId) {
    throw new ApiError(403, 'A sessão deve permanecer vinculada ao profissional autenticado');
  }
  const user = await prisma.user.findUnique({ where: { id: data.userId ?? current.userId, ...userScope(actor) } });
  if (!user) throw new ApiError(404, 'Usuário não encontrado');
  data.professionalId = actor.professionalId;
}

async function create(body, actor) {
  const data = dataFrom(body);
  await restrictAssignment(data, actor);
  validateDates(data);
  await Promise.all([
    ensureActive('user', data.userId, 'Usuário monitorado'),
    ensureActive('professional', data.professionalId, 'Profissional'),
  ]);
  return prisma.session.create({ data, include });
}

async function update(id, body, actor) {
  const current = await get(id, actor);
  const data = dataFrom(body, true);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nenhum campo válido foi informado');
  await restrictAssignment(data, actor, current);
  validateDates(data, current);
  await Promise.all([
    'userId' in data ? ensureActive('user', data.userId, 'Usuário monitorado') : null,
    'professionalId' in data ? ensureActive('professional', data.professionalId, 'Profissional') : null,
  ]);
  return prisma.session.update({ where: { id, ...sessionScope(actor) }, data, include });
}

async function remove(id) {
  await get(id);
  await prisma.session.delete({ where: { id } });
  return { message: 'Sessão e suas leituras foram removidas' };
}

module.exports = { list, get, create, update, remove };
