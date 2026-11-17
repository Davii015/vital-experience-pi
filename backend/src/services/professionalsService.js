const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { isProfessional, isPatient, professionalScope, userScope, sessionScope, reportScope } = require('../utils/access');
const { requiredString, optionalString, enumValue } = require('../utils/validation');

function dataFrom(body, partial = false) {
  const data = {};
  if (!partial || body.name !== undefined) data.name = requiredString(body.name, 'name');
  if (!partial || body.specialty !== undefined) data.specialty = requiredString(body.specialty, 'specialty');
  if (!partial || body.email !== undefined) data.email = requiredString(body.email, 'email').toLowerCase();
  if (body.phone !== undefined) data.phone = optionalString(body.phone);
  if (body.registrationNumber !== undefined) data.registrationNumber = optionalString(body.registrationNumber);
  if (body.status !== undefined) data.status = enumValue(body.status, 'status', ['ATIVO', 'INATIVO'], { optional: false });
  return data;
}

async function list(actor) {
  return prisma.professional.findMany({ where: professionalScope(actor), orderBy: { id: 'asc' },
    include: { _count: { select: { users: { where: userScope(actor) }, sessions: { where: sessionScope(actor) } } } } });
}

async function get(id, actor) {
  if ((isProfessional(actor) || isPatient(actor)) && id !== actor.professionalId) throw new ApiError(404, 'Profissional não encontrado');
  const professional = await prisma.professional.findUnique({ where: { id }, include: {
    users: { where: userScope(actor) }, sessions: { where: sessionScope(actor) }, reports: { where: reportScope(actor) },
  } });
  if (!professional) throw new ApiError(404, 'Profissional não encontrado');
  return professional;
}

async function create(body) {
  return prisma.professional.create({ data: dataFrom(body) });
}

async function update(id, body) {
  await get(id);
  const data = dataFrom(body, true);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nenhum campo válido foi informado');
  return prisma.professional.update({ where: { id }, data });
}

async function remove(id) {
  const professional = await get(id);
  const activeLinks = professional.users.filter((user) => user.status === 'ATIVO').length;
  if (activeLinks) throw new ApiError(409, 'Profissional possui usuários ativos vinculados e não pode ser removido');
  await prisma.professional.delete({ where: { id } });
  return { message: 'Profissional removido' };
}

module.exports = { list, get, create, update, remove };
