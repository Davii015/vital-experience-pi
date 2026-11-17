const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { requiredString, emailValue } = require('../utils/validation');

function publicAccount(account, role) {
  if (role === 'PATIENT') {
    const patient = account.user;
    return { id: account.id, userId: patient.id, name: patient.name, email: account.email, role,
      birthDate: patient.birthDate, conditionDescription: patient.conditionDescription,
      professionalName: patient.professional?.name || null };
  }
  if (role === 'PROFESSIONAL') {
    const p = account.professional;
    return { id: account.id, professionalId: p.id, name: p.name, email: p.email,
      role, specialty: p.specialty, registrationNumber: p.registrationNumber, phone: p.phone };
  }
  return { id: account.id, name: account.name, email: account.email, role: 'ADMIN' };
}

async function accountFor(actor) {
  const account = actor.role === 'PROFESSIONAL'
    ? await prisma.professionalAccount.findUnique({ where: { id: actor.id }, include: { professional: true } })
    : actor.role === 'PATIENT'
      ? await prisma.patientAccount.findUnique({ where: { id: actor.id }, include: { user: { include: { professional: true } } } })
      : await prisma.admin.findUnique({ where: { id: actor.id } });
  if (!account || (actor.role === 'PROFESSIONAL' && account.professional.status !== 'ATIVO') ||
      (actor.role === 'PATIENT' && account.user.status !== 'ATIVO')) {
    throw new ApiError(401, 'Sessão inválida');
  }
  return account;
}

function secret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new ApiError(500, 'JWT_SECRET deve conter pelo menos 32 caracteres');
  }
  return process.env.JWT_SECRET;
}

async function login(emailValueInput, passwordValue, role = 'ADMIN') {
  if (!['ADMIN', 'PROFESSIONAL', 'PATIENT'].includes(role)) throw new ApiError(400, 'Tipo de acesso inválido');
  const email = emailValue(emailValueInput);
  const password = requiredString(passwordValue, 'password');
  const account = role === 'ADMIN'
    ? await prisma.admin.findUnique({ where: { email } })
    : role === 'PROFESSIONAL'
      ? await prisma.professionalAccount.findFirst({ where: { professional: { email } }, include: { professional: true } })
      : await prisma.patientAccount.findUnique({ where: { email }, include: { user: { include: { professional: true } } } });
  if (!account || (role === 'PROFESSIONAL' && account.professional.status !== 'ATIVO') ||
      (role === 'PATIENT' && account.user.status !== 'ATIVO') ||
      !(await bcrypt.compare(password, account.passwordHash))) {
    throw new ApiError(401, 'Credenciais inválidas');
  }
  const csrfToken = crypto.randomBytes(32).toString('hex');
  const token = jwt.sign(
    { id: account.id, role, version: account.tokenVersion, csrf: csrfToken },
    secret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  return { token, csrfToken, user: publicAccount(account, role) };
}

async function me(actor) {
  return publicAccount(await accountFor(actor), actor.role);
}

async function updateMe(actor, body) {
  // Registration data is maintained by an administrator for both scoped roles.
  if (actor.role !== 'ADMIN') throw new ApiError(403, 'Solicite ao administrador a alteração dos dados cadastrais');
  const data = {};
  if (body.name !== undefined) data.name = requiredString(body.name, 'name');
  if (body.email !== undefined) data.email = emailValue(body.email);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nenhum campo válido foi informado');
  const admin = await prisma.admin.update({ where: { id: actor.id }, data });
  return publicAccount(admin, 'ADMIN');
}

async function changePassword(actor, currentValue, nextValue) {
  const currentPassword = requiredString(currentValue, 'currentPassword');
  const newPassword = requiredString(nextValue, 'newPassword');
  if (newPassword.length < 12) throw new ApiError(400, 'A nova senha deve ter pelo menos 12 caracteres');
  if (newPassword === currentPassword) throw new ApiError(400, 'A nova senha deve ser diferente da atual');
  const account = await accountFor(actor);
  if (!(await bcrypt.compare(currentPassword, account.passwordHash))) {
    throw new ApiError(401, 'Senha atual incorreta');
  }
  const model = actor.role === 'PROFESSIONAL' ? prisma.professionalAccount
    : actor.role === 'PATIENT' ? prisma.patientAccount : prisma.admin;
  await model.update({
    where: { id: actor.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12), tokenVersion: { increment: 1 } },
  });
  return { message: 'Senha alterada. Entre novamente.' };
}

module.exports = { login, me, updateMe, changePassword, secret };
