const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../src/config/prisma');
const app = require('../server');

test('acessos profissional e paciente: autenticação, isolamento, permissões e revogação por HTTP', async (t) => {
  const priorSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'professional-test-secret-with-more-than-32-characters';
  const password = 'Demonstracao-Teste-123!';
  const patientPassword = 'Paciente-Teste-123!';
  const tables = {
    admin: [{ id: 1, name: 'Admin', email: 'ana@example.com', passwordHash: bcrypt.hashSync('Admin-Password-123!', 4), tokenVersion: 0 }],
    professionalAccount: [{ id: 1, professionalId: 5, passwordHash: bcrypt.hashSync(password, 4), tokenVersion: 0 }],
    patientAccount: [{ id: 1, userId: 10, email: 'ana@example.com', passwordHash: bcrypt.hashSync(patientPassword, 4), tokenVersion: 0 }],
    professional: [
      { id: 5, name: 'Ana', email: 'ana@example.com', status: 'ATIVO', specialty: 'Fisioterapia' },
      { id: 6, name: 'Outro profissional', email: 'outro@example.com', status: 'ATIVO' },
    ],
    user: [{ id: 10, name: 'Paciente da Ana', professionalId: 5, status: 'ATIVO' },
      { id: 20, name: 'Paciente de outro profissional', professionalId: 6, status: 'ATIVO' }],
    session: [
      { id: 11, userId: 10, professionalId: 5, status: 'EM_ANDAMENTO', startedAt: new Date() },
      { id: 12, userId: 10, professionalId: 6, status: 'FINALIZADA' },
      { id: 13, userId: 20, professionalId: 5, status: 'FINALIZADA' },
      { id: 14, userId: 20, professionalId: 6, status: 'EM_ANDAMENTO' },
    ],
    sensor: [{ id: 1, userId: 10, status: 'ATIVO' }, { id: 2, userId: 20, status: 'ATIVO' }],
    sensorData: [{ id: 1, sessionId: 11, heartRate: 80 }, { id: 2, sessionId: 12, heartRate: 90 }, { id: 3, sessionId: 13, heartRate: 100 }, { id: 4, sessionId: 14, heartRate: 110 }],
    report: [{ id: 1, userId: 10, professionalId: 5 }, { id: 2, userId: 10, professionalId: 6 }],
  };
  const relationships = {
    user: ['user', 'userId'], professional: ['professional', 'professionalId'], session: ['session', 'sessionId'], sensor: ['sensor', 'sensorId'],
    users: ['user', null, 'professionalId'], sessions: ['session', null, 'userId'],
    reports: ['report', null, 'userId'], sensors: ['sensor', null, 'userId'], sensorData: ['sensorData', null, 'sessionId'],
  };
  function related(model, row, key) {
    const relation = relationships[key];
    if (!relation) throw new Error(`Unsupported test relation: ${key}`);
    const [target, foreign, back] = relation;
    if (foreign) return { model: target, value: tables[target].find((r) => r.id === row[foreign]) || null };
    const backKey = model === 'professional' ? 'professionalId' : back;
    return { model: target, value: tables[target].filter((r) => r[backKey] === row.id) };
  }
  function matches(model, row, where = {}) {
    return Object.entries(where).every(([key, value]) => {
      if (key === 'AND') return value.every((condition) => matches(model, row, condition));
      if (value && typeof value === 'object') {
        const relation = related(model, row, key);
        return relation.value && matches(relation.model, relation.value, value);
      }
      return row[key] === value;
    });
  }
  function project(model, row, include) {
    const result = { ...row };
    for (const [key, options] of Object.entries(include || {})) {
      if (key === '_count') {
        result._count = {};
        for (const [name, countOptions] of Object.entries(options.select)) {
          const relation = related(model, row, name);
          result._count[name] = relation.value.filter((r) => matches(relation.model, r, countOptions.where)).length;
        }
        continue;
      }
      const relation = related(model, row, key);
      result[key] = Array.isArray(relation.value)
        ? relation.value.filter((r) => matches(relation.model, r, options.where)).map((r) => project(relation.model, r, options.include))
        : relation.value ? project(relation.model, relation.value, options.include) : null;
    }
    return result;
  }
  const originals = {};
  for (const [name, rows] of Object.entries(tables)) {
    originals[name] = prisma[name];
    const find = async ({ where, include }) => {
      const row = rows.find((r) => matches(name, r, where));
      return row ? project(name, row, include) : null;
    };
    prisma[name] = {
      findUnique: find, findFirst: find,
      findMany: async ({ where, include } = {}) => rows.filter((r) => matches(name, r, where)).map((r) => project(name, r, include)),
      count: async ({ where } = {}) => rows.filter((r) => matches(name, r, where)).length,
      create: async ({ data, include }) => {
        const row = { id: Math.max(0, ...rows.map((r) => r.id)) + 1, status: 'EM_ANDAMENTO', ...data };
        rows.push(row); return project(name, row, include);
      },
      update: async ({ where, data, include }) => {
        const row = rows.find((r) => matches(name, r, where));
        if (!row) throw Object.assign(new Error('Not found'), { code: 'P2025' });
        for (const [key, value] of Object.entries(data)) row[key] = value?.increment ? row[key] + value.increment : value;
        return project(name, row, include);
      },
      delete: async () => { throw new Error('Professional must not reach delete'); },
    };
  }
  const server = app.listen(0);
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    for (const [key, value] of Object.entries(originals)) prisma[key] = value;
    if (priorSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = priorSecret;
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function call(path, { method = 'GET', body, token, cookie, csrf } = {}) {
    const response = await fetch(base + path, { method, headers: {
      'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  const loginBody = { email: 'ana@example.com', password, role: 'PROFESSIONAL' };
  const login = await call('/auth/login', { method: 'POST', body: { ...loginBody, mode: 'bearer' } });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, 'PROFESSIONAL');
  assert.equal(login.body.user.professionalId, 5);
  assert.equal(login.body.user.specialty, 'Fisioterapia');
  assert.ok(!JSON.stringify(login.body.user).includes('passwordHash'));
  const token = login.body.token;
  const cookieLogin = await call('/auth/login', { method: 'POST', body: loginBody });
  const cookie = cookieLogin.cookie;
  const csrf = cookieLogin.body.csrfToken;

  await t.test('paciente consulta apenas os próprios dados, inclusive relações e totais', async () => {
    const result = await call('/auth/login', { method: 'POST', body: { email: 'ana@example.com', password: patientPassword, role: 'PATIENT', mode: 'bearer' } });
    assert.equal(result.status, 200);
    assert.equal(result.body.user.role, 'PATIENT');
    assert.equal(result.body.user.userId, 10);
    assert.equal(result.body.user.professionalName, 'Ana');
    const patientToken = result.body.token;
    for (const [path, ids] of [['/users', [10]], ['/professionals', [5]], ['/sensors', [1]], ['/sessions', [11, 12]], ['/sensor-data', [1, 2]], ['/sensor-data/session/11', [1]]]) {
      const response = await call(path, { token: patientToken });
      assert.equal(response.status, 200, path);
      assert.deepEqual(response.body.map((row) => row.id), ids, path);
      assert.ok(!JSON.stringify(response.body).includes('passwordHash'));
      assert.ok(!JSON.stringify(response.body).includes('tokenVersion'));
    }
    for (const path of ['/users/20', '/users/999', '/professionals/6', '/sensors/2', '/sessions/13', '/sessions/14', '/sensor-data/session/14', '/reports/user/20']) {
      assert.equal((await call(path, { token: patientToken })).status, 404, path);
    }
    const self = (await call('/users/10', { token: patientToken })).body;
    assert.deepEqual(self.sessions.map((row) => row.id), [11, 12]);
    const professional = (await call('/professionals/5', { token: patientToken })).body;
    assert.deepEqual(professional.users.map((row) => row.id), [10]);
    assert.deepEqual(professional.sessions.map((row) => row.id), [11]);
    const report = (await call('/reports/user/10', { token: patientToken })).body;
    assert.equal(report.totalSessions, 2); assert.equal(report.totalReadings, 2);
    assert.deepEqual(report.reports.map((row) => row.id), [1, 2]);
    assert.deepEqual((await call('/reports/summary', { token: patientToken })).body,
      { users: 1, professionals: 1, activeSensors: 1, sessions: 2, sensorReadings: 2 });
    // A missing responsible professional cannot accidentally expose the whole directory.
    tables.user[0].professionalId = null;
    assert.deepEqual((await call('/professionals', { token: patientToken })).body, []);
    assert.equal((await call('/professionals/5', { token: patientToken })).status, 404);
    assert.equal((await call('/reports/summary', { token: patientToken })).body.professionals, 0);
    tables.user[0].professionalId = 5;
  });
  await t.test('paciente não pode alterar atendimentos, cadastros ou permissões', async () => {
    const loginResult = await call('/auth/login', { method: 'POST', body: { email: 'ana@example.com', password: patientPassword, role: 'PATIENT' } });
    const auth = { cookie: loginResult.cookie, csrf: loginResult.body.csrfToken };
    for (const resource of ['users', 'professionals', 'sensors', 'sessions', 'sensor-data']) {
      for (const method of ['POST', 'PUT', 'DELETE']) {
        if (resource === 'sensor-data' && method === 'PUT') continue;
        const response = await call(`/${resource}${method === 'POST' ? '' : '/10'}`, {
          ...auth, method, body: { id: 1, userId: 10, professionalId: 5, role: 'ADMIN', notes: 'Não alterar' },
        });
        assert.equal(response.status, 403, `${method} ${resource}`);
      }
    }
    assert.equal((await call('/auth/me', { ...auth, method: 'PUT', body: { role: 'ADMIN', userId: 20, email: 'changed@example.com' } })).status, 403);
    for (const role of ['ADMIN', 'PROFESSIONAL']) {
      assert.equal((await call('/auth/login', { method: 'POST', body: { email: 'ana@example.com', password: patientPassword, role } })).status, 401);
    }
    assert.equal((await call('/auth/password', { cookie: auth.cookie, method: 'PUT', body: { currentPassword: patientPassword, newPassword: 'Outra-Senha-Paciente-123' } })).status, 403);
  });
  await t.test('inativação e troca de senha do paciente invalidam sessões sem afetar outras contas', async () => {
    const body = { email: 'ana@example.com', password: patientPassword, role: 'PATIENT' };
    const session = await call('/auth/login', { method: 'POST', body });
    const bearer = (await call('/auth/login', { method: 'POST', body: { ...body, mode: 'bearer' } })).body.token;
    tables.user[0].status = 'INATIVO';
    assert.equal((await call('/auth/me', { token: bearer })).status, 401);
    assert.equal((await call('/auth/login', { method: 'POST', body })).status, 401);
    tables.user[0].status = 'ATIVO';
    const nextPassword = 'Outra-Senha-Paciente-123';
    assert.equal((await call('/auth/password', { token: bearer, method: 'PUT', body: { currentPassword: 'errada', newPassword: nextPassword } })).status, 401);
    assert.equal((await call('/auth/password', { token: bearer, method: 'PUT', body: { currentPassword: patientPassword, newPassword: 'curta' } })).status, 400);
    assert.equal((await call('/auth/password', { cookie: session.cookie, csrf: session.body.csrfToken, method: 'PUT', body: { currentPassword: patientPassword, newPassword: nextPassword } })).status, 200);
    assert.equal((await call('/auth/me', { token: bearer })).status, 401);
    assert.equal((await call('/auth/me', { cookie: session.cookie })).status, 401);
    assert.equal((await call('/auth/login', { method: 'POST', body })).status, 401);
    assert.equal((await call('/auth/login', { method: 'POST', body: { ...body, password: nextPassword } })).status, 200);
    assert.equal(tables.admin[0].tokenVersion, 0);
    assert.equal(tables.professionalAccount[0].tokenVersion, 0);
  });

  await t.test('tipo de acesso não promove a conta e senha/conta inexistente são rejeitadas', async () => {
    for (const body of [{ ...loginBody, role: 'ADMIN' }, { ...loginBody, password: 'errada' }, { ...loginBody, email: 'outro@example.com' }]) {
      assert.equal((await call('/auth/login', { method: 'POST', body })).status, 401);
    }
    assert.equal((await call('/auth/login', { method: 'POST', body: { ...loginBody, role: 'OWNER' } })).status, 400);
    assert.equal((await call('/auth/me', { token: token + 'x' })).status, 401);
    const invalidRole = jwt.sign({ id: 1, role: 'OWNER', version: 0 }, process.env.JWT_SECRET);
    assert.equal((await call('/auth/me', { token: invalidRole })).status, 401);
  });
  await t.test('listas, detalhes, relatórios e totais incluem somente vínculos autorizados', async () => {
    for (const [path, ids] of [['/users', [10]], ['/professionals', [5]], ['/sensors', [1]], ['/sessions', [11]], ['/sensor-data', [1]], ['/sensor-data/session/11', [1]]]) {
      const result = await call(path, { token });
      assert.equal(result.status, 200, path); assert.deepEqual(result.body.map((r) => r.id), ids, path);
      assert.ok(!JSON.stringify(result.body).includes('passwordHash'));
    }
    for (const path of ['/users/20', '/professionals/6', '/sensors/2', '/sessions/12', '/sessions/13', '/sessions/14', '/sensor-data/session/12', '/reports/user/20', '/users/9999']) {
      assert.equal((await call(path, { token })).status, 404, path);
    }
    const user = (await call('/users/10', { token })).body;
    assert.deepEqual(user.sessions.map((s) => s.id), [11]); assert.deepEqual(user.reports.map((r) => r.id), [1]);
    const self = (await call('/professionals/5', { token })).body;
    assert.deepEqual(self.users.map((u) => u.id), [10]); assert.deepEqual(self.sessions.map((s) => s.id), [11]);
    const report = (await call('/reports/user/10', { token })).body;
    assert.equal(report.totalSessions, 1); assert.equal(report.totalReadings, 1); assert.equal(report.avgHeartRate, 80);
    assert.deepEqual(report.reports.map((r) => r.id), [1]);
    assert.deepEqual((await call('/reports/summary', { token })).body, { users: 1, professionals: 1, activeSensors: 1, sessions: 1, sensorReadings: 1 });
  });
  await t.test('cadastros gerais, exclusões e alteração de identidade são bloqueados', async () => {
    for (const resource of ['users', 'professionals', 'sensors']) {
      for (const method of ['POST', 'PUT', 'DELETE']) {
        assert.equal((await call(`/${resource}${method === 'POST' ? '' : '/10'}`, { token, method, body: { professionalId: 5, role: 'ADMIN' } })).status, 403);
      }
    }
    for (const path of ['/sessions/11', '/sensor-data/1']) assert.equal((await call(path, { token, method: 'DELETE' })).status, 403);
    assert.equal((await call('/auth/me', { token, method: 'PUT', body: { name: 'Admin', role: 'ADMIN', professionalId: 6 } })).status, 403);
  });
  await t.test('pode registrar atendimento próprio, mas não trocar responsável nem acessar paciente alheio', async () => {
    const body = { userId: 10, sessionType: 'Demonstração', startedAt: new Date().toISOString() };
    assert.equal((await call('/sessions', { cookie, method: 'POST', body })).status, 403);
    const created = await call('/sessions', { cookie, csrf, method: 'POST', body });
    assert.equal(created.status, 201); assert.equal(created.body.professionalId, 5);
    assert.equal((await call('/sessions', { token, method: 'POST', body: { ...body, userId: 20 } })).status, 404);
    assert.equal((await call('/sessions', { token, method: 'POST', body: { ...body, professional_id: 6 } })).status, 403);
    assert.equal((await call('/sessions/11', { token, method: 'PUT', body: { professionalId: null } })).status, 403);
    assert.equal((await call('/sessions/11', { token, method: 'PUT', body: { user_id: 20 } })).status, 404);
    assert.equal((await call('/sessions/14', { token, method: 'PUT', body: { notes: 'Tentativa' } })).status, 404);
    assert.equal((await call('/sensor-data', { token, method: 'POST', body: { sessionId: 14, heartRate: 80 } })).status, 404);
    assert.equal((await call('/sensor-data', { token, method: 'POST', body: { sessionId: 11, sensorId: 2, heartRate: 80 } })).status, 409);
    assert.equal((await call('/sensor-data', { token, method: 'POST', body: { sessionId: 11, sensorId: 1, heartRate: 80 } })).status, 201);
    assert.equal((await call('/sessions/11', { token, method: 'PUT', body: { status: 'FINALIZADA', endedAt: new Date().toISOString() } })).status, 200);
  });
  await t.test('transferência de paciente, inativação e troca de senha revogam acesso', async () => {
    tables.user[0].professionalId = 6;
    assert.equal((await call('/sessions/11', { token })).status, 404);
    assert.equal((await call('/reports/user/10', { token })).status, 404);
    assert.equal((await call('/sensor-data/session/11', { token })).status, 404);
    tables.user[0].professionalId = 5;
    tables.professional[0].status = 'INATIVO';
    assert.equal((await call('/auth/me', { token })).status, 401);
    assert.equal((await call('/auth/login', { method: 'POST', body: loginBody })).status, 401);
    tables.professional[0].status = 'ATIVO';
    assert.equal((await call('/auth/password', { token, method: 'PUT', body: { currentPassword: 'errada', newPassword: 'Nova-Senha-123456' } })).status, 401);
    assert.equal((await call('/auth/password', { token, method: 'PUT', body: { currentPassword: password, newPassword: 'Nova-Senha-123456' } })).status, 200);
    assert.equal((await call('/auth/me', { token })).status, 401);
    assert.equal((await call('/auth/me', { cookie })).status, 401);
    assert.equal((await call('/auth/login', { method: 'POST', body: loginBody })).status, 401);
    assert.equal((await call('/auth/login', { method: 'POST', body: { ...loginBody, password: 'Nova-Senha-123456' } })).status, 200);
    assert.equal(tables.admin[0].tokenVersion, 0);
  });
});
