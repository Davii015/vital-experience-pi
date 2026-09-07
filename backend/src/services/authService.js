const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const ApiError = require('../errors/ApiError');
const { requiredString } = require('../utils/validation');

async function login(emailValue, passwordValue) {
  const email = requiredString(emailValue, 'email').toLowerCase();
  const password = requiredString(passwordValue, 'password');
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new ApiError(401, 'Credenciais inválidas');
  }
  if (!process.env.JWT_SECRET) throw new ApiError(500, 'JWT_SECRET não configurado no servidor');

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: 'ADMIN' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { token, user: { id: admin.id, name: admin.name, email: admin.email, role: 'ADMIN' } };
}

module.exports = { login };
