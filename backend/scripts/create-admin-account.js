// Create the first administrator without resetting any existing data or passwords.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { emailValue } = require('../src/utils/validation');
const prisma = new PrismaClient({ log: [] });

async function main() {
  const email = emailValue(process.env.ADMIN_EMAIL);
  if (await prisma.admin.findUnique({ where: { email } })) {
    console.log('O administrador já existe. A senha foi preservada.');
    return;
  }
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.trim() !== password || password.length < 12 || password === 'troque_esta_senha') {
    throw new Error('Configure ADMIN_PASSWORD com uma senha própria de 12+ caracteres, sem espaços nas extremidades.');
  }
  await prisma.admin.create({ data: { name: 'Administrador', email, passwordHash: await bcrypt.hash(password, 12) } });
  console.log('Administrador criado. Use o e-mail e a senha definidos no .env.');
}

main().catch((error) => {
  console.error(error.constructor === Error ? error.message : 'Não foi possível criar o administrador. Verifique o .env e as migrations.');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
