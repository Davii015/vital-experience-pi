const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { requiredString, emailValue } = require('../utils/validation');

function publicAdmin(admin) {
  return { id: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' };
}

function secret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new ApiError(500, 'JWT_SECRET deve conter pelo menos 32 caracteres');
  }
  return process.env.JWT_SECRET;
}

async function login(emailValueInput, passwordValue) {
  const email = emailValue(emailValueInput);
  const password = requiredString(passwordValue, 'password');
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new ApiError(401, 'Credenciais inválidas');
  }
  const csrfToken = crypto.randomBytes(32).toString('hex');
  const token = jwt.sign(
    { id: admin.id, role: 'ADMIN', version: admin.tokenVersion, csrf: csrfToken },
    secret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  return { token, csrfToken, user: publicAdmin(admin) };
}

async function me(id) {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin) throw new ApiError(401, 'Sessão inválida');
  return publicAdmin(admin);
}

async function updateMe(id, body) {
  const data = {};
  if (body.name !== undefined) data.name = requiredString(body.name, 'name');
  if (body.email !== undefined) data.email = emailValue(body.email);
  if (!Object.keys(data).length) throw new ApiError(400, 'Nenhum campo válido foi informado');
  const admin = await prisma.admin.update({ where: { id }, data });
  return publicAdmin(admin);
}

async function changePassword(id, currentValue, nextValue) {
  const currentPassword = requiredString(currentValue, 'currentPassword');
  const newPassword = requiredString(nextValue, 'newPassword');
  if (newPassword.length < 12) throw new ApiError(400, 'A nova senha deve ter pelo menos 12 caracteres');
  if (newPassword === currentPassword) throw new ApiError(400, 'A nova senha deve ser diferente da atual');
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
    throw new ApiError(401, 'Senha atual incorreta');
  }
  await prisma.admin.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12), tokenVersion: { increment: 1 } },
  });
  return { message: 'Senha alterada. Entre novamente.' };
}

module.exports = { login, me, updateMe, changePassword, secret };
