const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const bcrypt = require('bcryptjs');
const app = require('../server');
const prisma = require('../src/config/prisma');
const sensorDataService = require('../src/services/sensorDataService');

test('cliente frontend integra login, CSRF, cadastro, sessão, leitura e relatório por HTTP', async (t) => {
  const priorSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-only-secret-with-more-than-32-characters';
  t.after(() => { if (priorSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = priorSecret; });

  let admin = {
    id: 1, name: 'Admin Teste', email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('StrongPassword123!', 4), tokenVersion: 0,
  };
  const users = [];
  const sessions = [];
  const readings = [];
  const originalAdmin = prisma.admin;
  const originalUser = prisma.user;
  const originalSession = prisma.session;
  const originalSensorData = prisma.sensorData;
  const originalProfessional = prisma.professional;
  const originalSensor = prisma.sensor;
  t.after(() => {
    prisma.admin = originalAdmin;
    prisma.user = originalUser;
    prisma.session = originalSession;
    prisma.sensorData = originalSensorData;
    prisma.professional = originalProfessional;
    prisma.sensor = originalSensor;
  });
  prisma.admin = {
    findUnique: async ({ where }) => where.id === admin.id || where.email === admin.email ? { ...admin } : null,
    update: async ({ data }) => {
      admin = { ...admin, ...data, tokenVersion: data.tokenVersion?.increment ? admin.tokenVersion + 1 : admin.tokenVersion };
      return { ...admin };
    },
  };
  prisma.user = {
    findMany: async () => users.map((user) => ({ ...user })),
    findUnique: async ({ where, include }) => {
      const user = users.find((item) => item.id === where.id);
      if (!user) return null;
      if (include?.sessions) return { ...user, reports: [], sessions: sessions.filter((item) => item.userId === user.id).map((item) => ({ ...item, sensorData: readings.filter((reading) => reading.sessionId === item.id) })) };
      return { ...user };
    },
    count: async () => users.length,
    create: async ({ data }) => {
      const user = { ...data, id: users.length + 1, status: 'ATIVO', createdAt: new Date(), professional: null, sensors: [] };
      users.push(user);
      return { ...user };
    },
    update: async ({ where, data }) => {
      const index = users.findIndex((user) => user.id === where.id);
      users[index] = { ...users[index], ...data };
      return { ...users[index] };
    },
    delete: async ({ where }) => { users.splice(users.findIndex((user) => user.id === where.id), 1); },
  };
  prisma.session = {
    findMany: async () => [...sessions].reverse(),
    findUnique: async ({ where }) => sessions.find((item) => item.id === where.id) || null,
    create: async ({ data }) => {
      const session = { ...data, id: sessions.length + 1, status: data.status || 'EM_ANDAMENTO', endedAt: data.endedAt || null };
      sessions.push(session);
      return { ...session };
    },
    count: async () => sessions.length,
  };
  prisma.sensorData = {
    findMany: async () => [...readings].reverse(),
    create: async ({ data }) => {
      const reading = { ...data, id: readings.length + 1 };
      readings.push(reading);
      return { ...reading };
    },
    count: async () => readings.length,
  };
  prisma.professional = { count: async () => 0 };
  prisma.sensor = { count: async () => 0 };

  const server = app.listen(0);
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${base}/app/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Entrar no sistema/);
  assert.equal((await fetch(`${base}/api/users`)).status, 401);

  const badLogin = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'wrong' }),
  });
  assert.equal(badLogin.status, 401);

  let cookie = '';
  const browserFetch = async (url, options = {}) => {
    const response = await fetch(`${base}${url}`, {
      ...options,
      headers: { ...options.headers, ...(cookie ? { Cookie: cookie } : {}) },
    });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return response;
  };
  const context = { window: { VE_API_BASE_URL: '/api', location: { pathname: '/app/' } }, fetch: browserFetch, console, Date, setTimeout, clearTimeout };
  vm.createContext(context);
  const source = readFileSync(resolve(__dirname, '../../frontend/js/api.js'), 'utf8');
  vm.runInContext(`${source}\nglobalThis.client = API;`, context);
  const client = context.client;

  const loggedIn = await client.auth.login(admin.email, 'StrongPassword123!');
  assert.equal(loggedIn.name, 'Admin Teste');
  assert.match(cookie, /^ve_session=/);
  const me = await browserFetch('/api/auth/me');
  assert.equal(me.status, 200);
  const csrfToken = (await me.json()).csrfToken;
  assert.ok(csrfToken);

  const withoutCsrf = await browserFetch('/api/users', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Pessoa', conditionDescription: 'Teste' }),
  });
  assert.equal(withoutCsrf.status, 403);

  await client.load('users');
  assert.equal(client.users.getAll().length, 0);
  const created = await client.users.create({
    name: 'Pessoa Teste', birthDate: '2000-06-01', gender: 'Feminino',
    condition: 'Reabilitação', professionalId: null,
  });
  assert.equal(created.condition, 'Reabilitação');
  assert.equal(users[0].gender, 'FEMININO');
  assert.equal(users[0].conditionDescription, 'Reabilitação');
  assert.equal(client.users.getAll().length, 1);

  await client.users.update(created.id, {
    name: 'Pessoa Atualizada', birthDate: '2000-06-01', gender: 'Feminino',
    condition: 'Fisioterapia', professionalId: null,
  });
  assert.equal(client.users.getById(created.id).condition, 'Fisioterapia');
  const session = await client.sessions.create({
    userId: created.id, professionalId: null, type: 'Fisioterapia',
    startTime: new Date().toISOString(), endTime: null, status: 'Em andamento', notes: 'Teste',
  });
  assert.equal(session.status, 'Em andamento');
  const reading = await client.sensorData.simulate(session.id);
  assert.equal(reading.sessionId, session.id);
  assert.equal(readings.length, 1);
  const summary = await client.reports.summary();
  assert.equal(summary.users, 1);
  assert.equal(summary.sessions, 1);
  assert.equal(summary.sensorReadings, 1);
  const report = await client.reports.forUser(created.id);
  assert.equal(report.totalReadings, 1);
  assert.equal(report.readings.length, 1);
  await client.users.delete(created.id);
  assert.equal(client.users.getAll().length, 0);

  const changed = await client.auth.update({ name: 'Admin Atualizado', email: admin.email });
  assert.equal(changed.name, 'Admin Atualizado');
  await assert.rejects(client.auth.changePassword('wrong', 'AnotherStrongPassword123!'), /Senha atual incorreta/);
  await client.auth.changePassword('StrongPassword123!', 'AnotherStrongPassword123!');
  assert.equal((await browserFetch('/api/auth/me')).status, 401);
  assert.equal((await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'StrongPassword123!' }),
  })).status, 401);

  const bearerLogin = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: admin.email, password: 'AnotherStrongPassword123!', mode: 'bearer' }),
  });
  assert.equal(bearerLogin.status, 200);
  const bearer = (await bearerLogin.json()).token;
  assert.equal((await fetch(`${base}/api/users`, { headers: { Authorization: `Bearer ${bearer}` } })).status, 200);
  await assert.rejects(sensorDataService.create({ sessionId: 1, heartRate: 300 }), { statusCode: 400 });
});
