const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando dados anteriores...');
  await prisma.sensorData.deleteMany();
  await prisma.report.deleteMany();
  await prisma.session.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.admin.deleteMany();

  console.log('Inserindo administrador...');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  await prisma.admin.create({ data: {
    name: 'Administrador',
    email: (process.env.ADMIN_EMAIL || 'admin@vitalexperience.com').toLowerCase(),
    passwordHash: await bcrypt.hash(adminPassword, 10),
  }});

  // ── Profissionais ────────────────────────────────────────────────────────
  console.log('Inserindo profissionais...');
  const [ana, marcos, juliana, roberto] = await Promise.all([
    prisma.professional.create({ data: {
      name: 'Dra. Ana Paula Rodrigues',
      email: 'ana.paula@vitalexperience.com',
      phone: '(62) 98888-0001',
      specialty: 'Fisioterapia Esportiva',
      registrationNumber: 'CREFITO-9/12345-F',
      status: 'ATIVO',
    }}),
    prisma.professional.create({ data: {
      name: 'Dr. Marcos Lima',
      email: 'marcos.lima@vitalexperience.com',
      phone: '(62) 98888-0002',
      specialty: 'Educação Física',
      registrationNumber: 'CREF-09045-G/GO',
      status: 'ATIVO',
    }}),
    prisma.professional.create({ data: {
      name: 'Dra. Juliana Costa',
      email: 'juliana.costa@vitalexperience.com',
      phone: '(62) 98888-0003',
      specialty: 'Fisioterapia Neurológica',
      registrationNumber: 'CREFITO-9/67890-F',
      status: 'ATIVO',
    }}),
    prisma.professional.create({ data: {
      name: 'Dr. Roberto Farias',
      email: 'roberto.farias@vitalexperience.com',
      phone: '(62) 98888-0004',
      specialty: 'Ortopedia',
      registrationNumber: 'CRM-GO 54321',
      status: 'INATIVO',
    }}),
  ]);

  // ── Usuários ─────────────────────────────────────────────────────────────
  console.log('Inserindo usuários...');
  const [lucas, beatriz, carlos, mariana, thiago] = await Promise.all([
    prisma.user.create({ data: {
      name: 'Lucas Ferreira',
      email: 'lucas.ferreira@email.com',
      phone: '(62) 99111-0001',
      birthDate: new Date('1997-03-15'),
      gender: 'MASCULINO',
      conditionDescription: 'Reabilitação pós-cirurgia de joelho — LCA reconstruído',
      status: 'ATIVO',
      professionalId: ana.id,
    }}),
    prisma.user.create({ data: {
      name: 'Beatriz Santos',
      email: 'beatriz.santos@email.com',
      phone: '(62) 99111-0002',
      birthDate: new Date('1989-07-22'),
      gender: 'FEMININO',
      conditionDescription: 'Condicionamento físico pós-parto — recuperação muscular',
      status: 'ATIVO',
      professionalId: marcos.id,
    }}),
    prisma.user.create({ data: {
      name: 'Carlos Eduardo Moura',
      email: 'carlos.moura@email.com',
      phone: '(62) 99111-0003',
      birthDate: new Date('1972-11-08'),
      gender: 'MASCULINO',
      conditionDescription: 'AVC isquêmico — recuperação neuromotora membro superior direito',
      status: 'ATIVO',
      professionalId: juliana.id,
    }}),
    prisma.user.create({ data: {
      name: 'Mariana Oliveira',
      email: 'mariana.oliveira@email.com',
      phone: '(62) 99111-0004',
      birthDate: new Date('2005-01-30'),
      gender: 'FEMININO',
      conditionDescription: 'Atleta de atletismo — prevenção de lesões e otimização de desempenho',
      status: 'ATIVO',
      professionalId: ana.id,
    }}),
    prisma.user.create({ data: {
      name: 'Thiago Almeida',
      email: 'thiago.almeida@email.com',
      phone: '(62) 99111-0005',
      birthDate: new Date('1984-05-19'),
      gender: 'MASCULINO',
      conditionDescription: 'Lombalgia crônica — fortalecimento do core e postura',
      status: 'ATIVO',
      professionalId: marcos.id,
    }}),
  ]);

  // ── Sensores ─────────────────────────────────────────────────────────────
  console.log('Inserindo sensores...');
  const [s1, s2, s3, s4, s5, s6] = await Promise.all([
    prisma.sensor.create({ data: {
      name: 'HeartSens Pro V2',
      type: 'Monitor Cardíaco',
      serialNumber: 'HS-001-2026',
      status: 'ATIVO',
      batteryLevel: 87,
      lastSync: new Date('2026-05-14T09:30:00'),
      userId: lucas.id,
    }}),
    prisma.sensor.create({ data: {
      name: 'MotionTrack X3',
      type: 'Acelerômetro',
      serialNumber: 'MT-002-2026',
      status: 'ATIVO',
      batteryLevel: 64,
      lastSync: new Date('2026-05-14T08:45:00'),
      userId: beatriz.id,
    }}),
    prisma.sensor.create({ data: {
      name: 'OxyPulse Clip',
      type: 'Oxímetro',
      serialNumber: 'OP-003-2026',
      status: 'ATIVO',
      batteryLevel: 92,
      lastSync: new Date('2026-05-13T15:00:00'),
      userId: carlos.id,
    }}),
    prisma.sensor.create({ data: {
      name: 'GyroBalance Elite',
      type: 'Giroscópio',
      serialNumber: 'GB-004-2026',
      status: 'INATIVO',
      batteryLevel: 12,
      lastSync: new Date('2026-05-10T11:00:00'),
      userId: null,
    }}),
    prisma.sensor.create({ data: {
      name: 'EMG ProSens 8CH',
      type: 'Eletromiógrafo',
      serialNumber: 'EP-005-2026',
      status: 'ATIVO',
      batteryLevel: 78,
      lastSync: new Date('2026-05-14T10:00:00'),
      userId: mariana.id,
    }}),
    prisma.sensor.create({ data: {
      name: 'ThermoSkin Patch',
      type: 'Termômetro Cutâneo',
      serialNumber: 'TS-006-2026',
      status: 'ATIVO',
      batteryLevel: 55,
      lastSync: new Date('2026-05-14T09:00:00'),
      userId: thiago.id,
    }}),
  ]);

  // ── Sessões ──────────────────────────────────────────────────────────────
  console.log('Inserindo sessões...');
  const [sess1, sess2, sess3, sess4, sess5] = await Promise.all([
    prisma.session.create({ data: {
      userId: lucas.id,
      professionalId: ana.id,
      title: 'Reabilitação Joelho — Semana 4',
      sessionType: 'Fisioterapia',
      notes: 'Exercícios de cadeia cinética fechada. Paciente evoluiu bem na extensão.',
      startedAt: new Date('2026-05-10T09:00:00'),
      endedAt:   new Date('2026-05-10T10:00:00'),
      status: 'FINALIZADA',
    }}),
    prisma.session.create({ data: {
      userId: beatriz.id,
      professionalId: marcos.id,
      title: 'Treino Cardio — Módulo 2',
      sessionType: 'Cardio',
      notes: 'Esteira e bicicleta ergométrica. FCmáx atingida: 142 bpm.',
      startedAt: new Date('2026-05-11T08:00:00'),
      endedAt:   new Date('2026-05-11T08:45:00'),
      status: 'FINALIZADA',
    }}),
    prisma.session.create({ data: {
      userId: carlos.id,
      professionalId: juliana.id,
      title: 'Estimulação Neuromotora — Sessão 12',
      sessionType: 'Reabilitação',
      notes: 'Estimulação motora fina. Melhora na pinça digital.',
      startedAt: new Date('2026-05-12T14:00:00'),
      endedAt:   new Date('2026-05-12T15:30:00'),
      status: 'FINALIZADA',
    }}),
    prisma.session.create({ data: {
      userId: mariana.id,
      professionalId: ana.id,
      title: 'Avaliação Funcional — Sprint e Agilidade',
      sessionType: 'Avaliação Funcional',
      notes: 'Teste de sprint 40m e shuttle run. Resultado acima da média para a faixa etária.',
      startedAt: new Date('2026-05-13T10:00:00'),
      endedAt:   new Date('2026-05-13T11:00:00'),
      status: 'FINALIZADA',
    }}),
    prisma.session.create({ data: {
      userId: thiago.id,
      professionalId: marcos.id,
      title: 'Core e Postura — Sessão Atual',
      sessionType: 'Fisioterapia',
      notes: null,
      startedAt: new Date('2026-05-14T09:30:00'),
      endedAt:   null,
      status: 'EM_ANDAMENTO',
    }}),
  ]);

  // ── SensorData ───────────────────────────────────────────────────────────
  console.log('Inserindo dados de sensores...');

  function rnd(min, max) { return Math.round(min + Math.random() * (max - min)); }
  function rndF(min, max) { return parseFloat((min + Math.random() * (max - min)).toFixed(1)); }

  const effortLevels = ['Baixo', 'Moderado', 'Alto', 'Muito Alto'];
  const fatigueMap   = { 'Baixo': 'BAIXO', 'Moderado': 'BAIXO', 'Alto': 'MODERADO', 'Muito Alto': 'ALTO' };

  function buildReadings(sessionId, sensorId, count, hrMin, hrMax) {
    return Array.from({ length: count }, (_, i) => {
      const hr      = rnd(hrMin, hrMax);
      const effort  = hr < 90 ? 'Baixo' : hr < 110 ? 'Moderado' : hr < 130 ? 'Alto' : 'Muito Alto';
      const minutes = i * 5;
      return {
        sessionId,
        sensorId,
        heartRate:       hr,
        movementLevel:   rndF(0.1, 2.5),
        effortLevel:     effort,
        fatigueRisk:     fatigueMap[effort],
        bodyTemperature: rndF(36.2, 37.8),
        oxygenLevel:     rndF(94.5, 99.0),
        steps:           rnd(0, 200),
        recordedAt:      new Date(Date.now() - (count - i) * 60000 * 5),
      };
    });
  }

  await prisma.sensorData.createMany({ data: [
    ...buildReadings(sess1.id, s1.id, 8, 72, 125),
    ...buildReadings(sess2.id, s2.id, 9, 68, 145),
    ...buildReadings(sess3.id, s3.id, 7, 65, 92),
    ...buildReadings(sess4.id, s5.id, 9, 75, 155),
    ...buildReadings(sess5.id, s6.id, 4, 70, 105),
  ]});

  // ── Relatórios ───────────────────────────────────────────────────────────
  console.log('Inserindo relatórios...');
  await Promise.all([
    prisma.report.create({ data: {
      userId: lucas.id,
      professionalId: ana.id,
      title: 'Relatório de Evolução — Semana 4',
      summary: 'Paciente apresenta boa recuperação da amplitude de movimento. Dor reduzida de 7/10 para 3/10.',
      evolutionStatus: 'Positiva',
      recommendation: 'Manter protocolo atual. Iniciar exercícios de propriocepção na próxima semana.',
    }}),
    prisma.report.create({ data: {
      userId: beatriz.id,
      professionalId: marcos.id,
      title: 'Avaliação Cardiovascular — Mês 2',
      summary: 'Melhora significativa no VO2max estimado. FC de repouso caiu de 82 para 74 bpm.',
      evolutionStatus: 'Excelente',
      recommendation: 'Aumentar intensidade para Zona 3 nas próximas sessões.',
    }}),
    prisma.report.create({ data: {
      userId: carlos.id,
      professionalId: juliana.id,
      title: 'Progresso Neuromotor — Sessão 12',
      summary: 'Melhora na coordenação motora fina. Escala de Fugl-Meyer: 38 pontos (era 31).',
      evolutionStatus: 'Moderada',
      recommendation: 'Continuar estimulação bilateral. Incluir tarefas de vida diária simuladas.',
    }}),
    prisma.report.create({ data: {
      userId: mariana.id,
      professionalId: ana.id,
      title: 'Avaliação de Desempenho — Atletismo',
      summary: 'Sprint 40m: 5.3s (-0.2s vs. avaliação anterior). Agility T-test: 10.1s.',
      evolutionStatus: 'Excelente',
      recommendation: 'Foco em fortalecimento excêntrico de isquiotibiais para prevenção de lesões.',
    }}),
    prisma.report.create({ data: {
      userId: thiago.id,
      professionalId: marcos.id,
      title: 'Avaliação Postural Inicial',
      summary: 'Hiperlordose lombar com encurtamento de iliopsoas. Fraqueza de multífido L4-L5.',
      evolutionStatus: 'Em acompanhamento',
      recommendation: 'Iniciar protocolo de estabilização lombar 3x/semana. Orientar ergonomia no trabalho.',
    }}),
  ]);

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => { console.error('Erro no seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
