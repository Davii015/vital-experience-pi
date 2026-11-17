// Provision a login for an existing patient without seeding/resetting clinical data.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { emailValue } = require('../src/utils/validation');
const prisma = new PrismaClient({ log: [] });

async function main() {
  const userId = Number(process.argv[2]);
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error('Use: npm run account:patient -- <id> [email]');
  const patient = await prisma.user.findUnique({ where: { id: userId } });
  if (!patient || patient.status !== 'ATIVO') throw new Error('Paciente não encontrado ou inativo');
  if (await prisma.patientAccount.findUnique({ where: { userId } })) {
    console.log('O paciente já possui uma conta. A senha foi preservada.');
    return;
  }
  const email = emailValue(process.argv[3] || patient.email);
  const password = crypto.randomBytes(18).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 12);
  const credentialsPath = path.resolve(__dirname, `../.env.patient-${userId}`);
  fs.writeFileSync(credentialsPath, [
    '# Credenciais locais de demonstração — não publicar ou compartilhar.',
    `PATIENT_ID=${userId}`, `PATIENT_EMAIL=${JSON.stringify(email)}`,
    `PATIENT_PASSWORD=${JSON.stringify(password)}`, 'PATIENT_ROLE=PATIENT', '',
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  try {
    await prisma.patientAccount.create({ data: { userId, email, passwordHash } });
  } catch (error) {
    fs.unlinkSync(credentialsPath);
    throw error;
  }
  console.log(`Conta de paciente criada para ${patient.name}.`);
  console.log(`Credenciais salvas somente no arquivo local ${credentialsPath}`);
}

main().catch((error) => {
  const safeCodes = { EEXIST: 'O arquivo de credenciais já existe e foi preservado.', P2002: 'Conta ou e-mail já cadastrado.' };
  console.error(safeCodes[error.code] || (error.constructor === Error ? error.message : 'Não foi possível criar a conta. Verifique o e-mail, a conexão e as migrations.'));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
