const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
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

async function list() {
  return prisma.professional.findMany({ orderBy: { id: 'asc' }, include: { _count: { select: { users: true, sessions: true } } } });
}

async function get(id) {
  const professional = await prisma.professional.findUnique({ where: { id }, include: { users: true, sessions: true, reports: true } });
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
