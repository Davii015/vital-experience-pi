const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { requiredString, optionalString, positiveInt, dateValue, enumValue, requestValue } = require('../utils/validation');

const include = { professional: true, sensors: true };

async function ensureProfessional(id) {
  if (!id) return;
  const professional = await prisma.professional.findUnique({ where: { id } });
  if (!professional) throw new ApiError(400, 'Profissional responsável não encontrado');
  if (professional.status !== 'ATIVO') throw new ApiError(409, 'O profissional responsável está inativo');
}

function dataFrom(body, partial = false) {
  const source = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    birthDate: requestValue(body, 'birthDate', 'birth_date'),
    gender: body.gender,
    conditionDescription: requestValue(body, 'conditionDescription', 'condition_description') ?? body.condition,
    status: body.status,
    professionalId: requestValue(body, 'professionalId', 'professional_id'),
  };
  const data = {};
  if (!partial || source.name !== undefined) data.name = requiredString(source.name, 'name');
  if (!partial || source.conditionDescription !== undefined) data.conditionDescription = requiredString(source.conditionDescription, 'conditionDescription');
  if (source.email !== undefined) data.email = optionalString(source.email)?.toLowerCase();
  if (source.phone !== undefined) data.phone = optionalString(source.phone);
  if (source.birthDate !== undefined) data.birthDate = dateValue(source.birthDate, 'birthDate', { optional: true });
  if (source.gender !== undefined) data.gender = enumValue(source.gender, 'gender', ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO']);
  if (source.status !== undefined) data.status = enumValue(source.status, 'status', ['ATIVO', 'INATIVO'], { optional: false });
  if (source.professionalId !== undefined) data.professionalId = positiveInt(source.professionalId, 'professionalId', { optional: true });
  return data;
}

async function list() {
  return prisma.user.findMany({ orderBy: { id: 'asc' }, include });
}

async function get(id) {
  const user = await prisma.user.findUnique({ where: { id }, include: { ...include, sessions: true, reports: true } });
  if (!user) throw new ApiError(404, 'Usuário não encontrado');
  return user;
}

async function create(body) {
  const data = dataFrom(body);
  await ensureProfessional(data.professionalId);
  return prisma.user.create({ data, include });
}

async function update(id, body) {
  await get(id);
  const data = dataFrom(body, true);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nenhum campo válido foi informado');
  if ('professionalId' in data) await ensureProfessional(data.professionalId);
  return prisma.user.update({ where: { id }, data, include });
}

async function remove(id) {
  await get(id);
  await prisma.user.delete({ where: { id } });
  return { message: 'Usuário removido' };
}

module.exports = { list, get, create, update, remove };
