// Run from backend/: npm run account:professional -- <professionalId>
// Creates an account for an existing active professional; never resets an account.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const prisma = new PrismaClient({ log: [] });

async function main() {
  const professionalId = Number(process.argv[2]);
  if (!Number.isSafeInteger(professionalId) || professionalId <= 0) {
    throw new Error('Informe o ID do profissional: npm run account:professional -- 5');
  }
  const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
  if (!professional || professional.status !== 'ATIVO') throw new Error('Profissional não encontrado ou inativo');
  const existing = await prisma.professionalAccount.findUnique({ where: { professionalId } });
  if (existing) {
    console.log('O profissional já possui uma conta. A senha existente foi preservada.');
    return;
  }
  const password = crypto.randomBytes(18).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 12);
  const credentialsPath = path.resolve(__dirname, `../.env.professional-${professionalId}`);
  fs.writeFileSync(credentialsPath, [
    '# Credenciais locais de demonstração — não publicar ou compartilhar o arquivo.',
    `PROFESSIONAL_ID=${professionalId}`,
    `PROFESSIONAL_EMAIL=${JSON.stringify(professional.email)}`,
    `PROFESSIONAL_PASSWORD=${JSON.stringify(password)}`,
    'PROFESSIONAL_ROLE=PROFESSIONAL', '',
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  try {
    await prisma.professionalAccount.create({ data: { professionalId, passwordHash } });
  } catch (error) {
    fs.unlinkSync(credentialsPath);
    throw error;
  }
  console.log(`Conta profissional criada para ${professional.name}.`);
  console.log(`Credenciais salvas somente no arquivo local ${credentialsPath}`);
}

main().catch((error) => {
  const safeCodes = { EEXIST: 'O arquivo de credenciais já existe. Não foi sobrescrito.', P2002: 'A conta já existe.' };
  console.error(safeCodes[error.code] || (error.constructor === Error ? error.message : 'Não foi possível criar a conta. Confira a conexão e as migrations.'));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
