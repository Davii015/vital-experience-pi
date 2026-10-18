/* Comunicação HTTP e adaptação dos dados da API para as telas. */
const API_BASE = window.VE_API_BASE_URL || '/api';
const GENDERS = { MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro', NAO_INFORMADO: 'Prefiro não informar' };
const GENDER_VALUES = Object.fromEntries(Object.entries(GENDERS).map(([key, value]) => [value, key]));
const STATUSES = { ATIVO: 'Ativo', INATIVO: 'Inativo' };
const STATUS_VALUES = Object.fromEntries(Object.entries(STATUSES).map(([key, value]) => [value, key]));
const SESSION_STATUSES = { EM_ANDAMENTO: 'Em andamento', FINALIZADA: 'Concluída', CANCELADA: 'Cancelada' };
const SESSION_VALUES = Object.fromEntries(Object.entries(SESSION_STATUSES).map(([key, value]) => [value, key]));
const FATIGUE = { BAIXO: 'Baixo', MODERADO: 'Moderado', ALTO: 'Alto' };

const state = { user: null, csrfToken: null, users: [], professionals: [], sensors: [], sessions: [], sensorData: [] };

function ageFromBirthDate(value) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
}

const map = {
  users: (item) => ({ ...item, age: ageFromBirthDate(item.birthDate), gender: GENDERS[item.gender] || 'Não informado', condition: item.conditionDescription }),
  professionals: (item) => ({ ...item, status: STATUSES[item.status] || item.status }),
  sensors: (item) => ({ ...item, model: item.name, serial: item.serialNumber, status: STATUSES[item.status] || item.status }),
  sessions: (item) => ({ ...item, type: item.sessionType, startTime: item.startedAt, endTime: item.endedAt, status: SESSION_STATUSES[item.status] || item.status }),
  sensorData: (item) => ({ ...item, movement: item.movementLevel, spO2: item.oxygenLevel, fatigueState: FATIGUE[item.fatigueRisk] || null, timestamp: item.recordedAt }),
};

async function request(path, { method = 'GET', data, redirectOn401 = true } = {}) {
  const headers = {};
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD'].includes(method) && state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method, headers, credentials: 'include',
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o servidor está disponível.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && redirectOn401) {
      state.user = null;
      state.csrfToken = null;
      window.location.href = '/app/';
    }
    throw new Error(payload.error || `Falha HTTP ${response.status}`);
  }
  return payload;
}

async function load(...resources) {
  const paths = { users: '/users', professionals: '/professionals', sensors: '/sensors', sessions: '/sessions', sensorData: '/sensor-data' };
  await Promise.all(resources.map(async (resource) => {
    if (!paths[resource]) throw new Error(`Recurso desconhecido: ${resource}`);
    const rows = await request(paths[resource]);
    state[resource] = rows.map(map[resource]);
    if (resource === 'sensorData') state[resource].reverse();
  }));
}

function collection(resource, path, payload) {
  return {
    getAll: () => state[resource],
    getById: (id) => state[resource].find((item) => item.id === Number(id)),
    async create(data) {
      const result = await request(path, { method: 'POST', data: payload(data) });
      await load(resource);
      return map[resource](result);
    },
    async update(id, data) {
      const result = await request(`${path}/${id}`, { method: 'PUT', data: payload(data) });
      await load(resource);
      return map[resource](result);
    },
    async delete(id) {
      const result = await request(`${path}/${id}`, { method: 'DELETE' });
      await load(resource);
      return result;
    },
  };
}

const API = {
  load,
  request,
  auth: {
    getUser: () => state.user,
    async login(email, password) {
      const result = await request('/auth/login', { method: 'POST', data: { email, password }, redirectOn401: false });
      state.user = result.user;
      state.csrfToken = result.csrfToken;
      return result.user;
    },
    async requireAuth() {
      try {
        const result = await request('/auth/me');
        state.user = result.user;
        state.csrfToken = result.csrfToken;
        return state.user;
      } catch (error) {
        if (window.location.pathname !== '/app/') window.location.href = '/app/';
        return null;
      }
    },
    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
        state.user = null;
        state.csrfToken = null;
        window.location.href = '/app/';
      } catch (error) { showToast(error.message, 'error'); }
    },
    async update(data) {
      const result = await request('/auth/me', { method: 'PUT', data });
      state.user = result.user;
      return result.user;
    },
    async changePassword(currentPassword, newPassword) {
      const result = await request('/auth/password', { method: 'PUT', data: { currentPassword, newPassword }, redirectOn401: false });
      state.user = null;
      state.csrfToken = null;
      return result;
    },
  },
  users: collection('users', '/users', (data) => ({
    name: data.name,
    birthDate: data.birthDate || null,
    gender: GENDER_VALUES[data.gender] || data.gender,
    conditionDescription: data.condition,
    professionalId: data.professionalId,
  })),
  professionals: collection('professionals', '/professionals', (data) => data),
  sensors: collection('sensors', '/sensors', (data) => ({
    name: data.model, type: data.type, serialNumber: data.serial || null,
    status: STATUS_VALUES[data.status] || data.status, userId: data.userId,
  })),
  sessions: collection('sessions', '/sessions', (data) => ({
    userId: data.userId, professionalId: data.professionalId,
    sessionType: data.type, startedAt: data.startTime, endedAt: data.endTime,
    status: SESSION_VALUES[data.status] || data.status, notes: data.notes,
  })),
  sensorData: {
    getAll: () => state.sensorData,
    getBySession: (id) => state.sensorData.filter((item) => item.sessionId === Number(id)),
    async simulate(sessionId) {
      const heartRate = Math.floor(70 + Math.random() * 75);
      const result = await request('/sensor-data', { method: 'POST', data: {
        sessionId, heartRate, movementLevel: Number((Math.random() * 2.5).toFixed(2)),
        effortLevel: heartRate > 130 ? 'Alto' : heartRate > 105 ? 'Moderado' : 'Baixo',
        fatigueRisk: heartRate > 130 ? 'ALTO' : heartRate > 105 ? 'MODERADO' : 'BAIXO',
        oxygenLevel: Number((95 + Math.random() * 4).toFixed(1)),
      } });
      await load('sensorData');
      return map.sensorData(result);
    },
  },
  reports: {
    async forUser(id) {
      const report = await request(`/reports/user/${id}`);
      const sessions = report.sessions.map(map.sessions);
      const readings = report.sessions.flatMap((item) => item.sensorData.map(map.sensorData));
      const fatigueDistribution = Object.fromEntries(Object.entries(report.fatigueDistribution).map(([key, count]) => [FATIGUE[key] || key, count]));
      return { ...report, sessions, readings, fatigueDistribution };
    },
    summary: () => request('/reports/summary'),
  },
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function fmtDate(value) { return value ? new Date(value).toLocaleDateString('pt-BR') : '—'; }
function fmtDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}
function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
function getDuration(start, end) {
  if (!start || !end) return '—';
  return `${Math.max(0, Math.floor((new Date(end) - new Date(start)) / 60000))} min`;
}
function getInitials(name) { return (name || '?').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = document.createElement('span');
  icon.textContent = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }[type] || '●';
  const content = document.createElement('span');
  content.textContent = message;
  toast.append(icon, content);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}
function setTopbarUser(user) {
  if (!user) return;
  for (const id of ['topbarUserName', 'sidebarUserName']) {
    const element = document.getElementById(id);
    if (element) element.textContent = user.name;
  }
  const avatar = document.getElementById('topbarAvatar');
  if (avatar) avatar.textContent = getInitials(user.name);
}
