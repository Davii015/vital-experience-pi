/* ============================================================
   VITAL EXPERIENCE — api.js
   Camada de dados simulada com localStorage
   Substitui o backend enquanto a integração não está completa
   ============================================================ */

const VE = {
  auth:        've_auth',
  users:       've_users',
  profs:       've_professionals',
  sensors:     've_sensors',
  sessions:    've_sessions',
  sensorData:  've_sensor_data',
  alerts:      've_alerts'
};

/* === STORAGE HELPERS === */
const store = {
  get(key)        { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  set(key, val)   { localStorage.setItem(key, JSON.stringify(val)); },
  nextId(list)    { return list.length ? Math.max(...list.map(i => i.id)) + 1 : 1; }
};

/* ============================================================
   SEED DATA — carregado automaticamente na primeira abertura
   ============================================================ */
function seedIfEmpty() {
  if (!store.get(VE.profs).length) {
    store.set(VE.profs, [
      { id: 1, name: 'Dr. Carlos Mendes',    specialty: 'Fisioterapia',           email: 'carlos@vitalexp.com', phone: '(62) 99123-4567', createdAt: '2026-02-01' },
      { id: 2, name: 'Dra. Ana Paula Rocha', specialty: 'Educação Física',         email: 'ana@vitalexp.com',    phone: '(62) 99234-5678', createdAt: '2026-02-05' },
      { id: 3, name: 'Dr. Paulo Sousa',      specialty: 'Fisioterapia Esportiva',  email: 'paulo@vitalexp.com',  phone: '(62) 99345-6789', createdAt: '2026-02-10' }
    ]);
  }

  if (!store.get(VE.users).length) {
    store.set(VE.users, [
      { id: 1, name: 'Lucas Ferreira',  age: 32, gender: 'Masculino', condition: 'Reabilitação pós-cirurgia',  professionalId: 1, createdAt: '2026-02-15' },
      { id: 2, name: 'Mariana Costa',   age: 25, gender: 'Feminino',  condition: 'Fisioterapia esportiva',     professionalId: 2, createdAt: '2026-02-18' },
      { id: 3, name: 'Roberto Alves',   age: 45, gender: 'Masculino', condition: 'Esporte adaptado',           professionalId: 1, createdAt: '2026-02-20' },
      { id: 4, name: 'Juliana Lima',    age: 28, gender: 'Feminino',  condition: 'Reabilitação neurológica',   professionalId: 3, createdAt: '2026-03-01' }
    ]);
  }

  if (!store.get(VE.sensors).length) {
    store.set(VE.sensors, [
      { id: 1, type: 'Monitor Cardíaco', model: 'HeartSens Pro V2',  userId: 1, status: 'Ativo',   serial: 'HS-001-2026' },
      { id: 2, type: 'Acelerômetro',     model: 'MotionTrack X3',    userId: 1, status: 'Ativo',   serial: 'MT-001-2026' },
      { id: 3, type: 'Giroscópio',       model: 'GyroFlex 100',      userId: 2, status: 'Ativo',   serial: 'GF-001-2026' },
      { id: 4, type: 'Monitor Cardíaco', model: 'HeartSens Pro V2',  userId: 3, status: 'Inativo', serial: 'HS-002-2026' },
      { id: 5, type: 'Acelerômetro',     model: 'MotionTrack X3',    userId: 4, status: 'Ativo',   serial: 'MT-002-2026' }
    ]);
  }

  if (!store.get(VE.sessions).length) {
    store.set(VE.sessions, [
      { id: 1, userId: 1, startTime: '2026-05-10T09:00', endTime: '2026-05-10T09:45', type: 'Fisioterapia',    notes: 'Aquecimento e fortalecimento', status: 'Concluída' },
      { id: 2, userId: 2, startTime: '2026-05-11T10:00', endTime: '2026-05-11T10:50', type: 'Treino Adaptado', notes: 'Exercícios de equilíbrio',      status: 'Concluída' },
      { id: 3, userId: 1, startTime: '2026-05-12T09:00', endTime: '2026-05-12T09:55', type: 'Fisioterapia',    notes: 'Progressão de carga',           status: 'Concluída' },
      { id: 4, userId: 3, startTime: '2026-05-13T14:00', endTime: '2026-05-13T14:40', type: 'Esporte Adaptado',notes: 'Avaliação funcional',           status: 'Concluída' },
      { id: 5, userId: 4, startTime: '2026-05-14T08:00', endTime: null,               type: 'Reabilitação',    notes: 'Sessão em andamento',           status: 'Em andamento' }
    ]);
  }

  if (!store.get(VE.sensorData).length) {
    const rows = [];
    let id = 1;
    const movements = ['Baixo', 'Moderado', 'Alto', 'Muito Alto'];
    const fatigues   = ['Sem fadiga', 'Fadiga leve', 'Fadiga moderada', 'Fadiga elevada'];

    [[1,9],[2,10],[3,11],[4,8]].forEach(([sessionId, n]) => {
      for (let i = 0; i < n; i++) {
        const hr = Math.floor(72 + Math.random() * 68);
        rows.push({
          id: id++,
          sessionId,
          heartRate:     hr,
          movementLevel: movements[Math.floor(Math.random() * 4)],
          effort:        Math.floor(3 + Math.random() * 7),
          fatigue:       fatigues[ hr > 130 ? 2 + (Math.random() > 0.5 ? 1 : 0) : Math.floor(Math.random() * 2) ],
          recordedAt:    new Date(Date.now() - (n - i) * 5 * 60000).toISOString()
        });
      }
    });
    store.set(VE.sensorData, rows);
  }

  if (!store.get(VE.alerts).length) {
    store.set(VE.alerts, [
      { id: 1, type: 'warning', message: 'FC elevada detectada — Lucas Ferreira (148 bpm)',     time: '14:32', read: false },
      { id: 2, type: 'info',    message: 'Sessão iniciada — Juliana Lima (Reabilitação)',        time: '08:00', read: false },
      { id: 3, type: 'success', message: 'Relatório gerado — Mariana Costa (Semana 1)',          time: 'Ontem', read: true  }
    ]);
  }
}

/* ============================================================
   API — interface pública do sistema
   ============================================================ */
const API = {

  /* --- AUTH --- */
  auth: {
    login(email, password) {
      if (!email || !password || password.length < 6)
        return { ok: false, error: 'E-mail inválido ou senha deve ter pelo menos 6 caracteres.' };
      const initials = email.split('@')[0].slice(0,2).toUpperCase();
      const user = { email, name: email.split('@')[0], initials, role: 'Administrador' };
      localStorage.setItem(VE.auth, JSON.stringify(user));
      return { ok: true, user };
    },
    logout() {
      localStorage.removeItem(VE.auth);
      const inPages = window.location.pathname.includes('/pages/');
      window.location.href = inPages ? '../index.html' : 'index.html';
    },
    getUser() {
      try { return JSON.parse(localStorage.getItem(VE.auth)); } catch { return null; }
    },
    requireAuth() {
      const u = this.getUser();
      if (!u) {
        const inPages = window.location.pathname.includes('/pages/');
        window.location.href = inPages ? '../index.html' : 'index.html';
        return null;
      }
      return u;
    }
  },

  /* --- USERS (monitored) --- */
  users: {
    getAll()     { return store.get(VE.users); },
    getById(id)  { return store.get(VE.users).find(u => u.id === id); },
    create(data) {
      const list = store.get(VE.users);
      const item = { ...data, id: store.nextId(list), createdAt: today() };
      store.set(VE.users, [...list, item]);
      return item;
    },
    update(id, data) {
      const list = store.get(VE.users).map(u => u.id === id ? { ...u, ...data } : u);
      store.set(VE.users, list);
      return list.find(u => u.id === id);
    },
    delete(id) { store.set(VE.users, store.get(VE.users).filter(u => u.id !== id)); }
  },

  /* --- PROFESSIONALS --- */
  professionals: {
    getAll()     { return store.get(VE.profs); },
    getById(id)  { return store.get(VE.profs).find(p => p.id === id); },
    create(data) {
      const list = store.get(VE.profs);
      const item = { ...data, id: store.nextId(list), createdAt: today() };
      store.set(VE.profs, [...list, item]);
      return item;
    },
    update(id, data) {
      const list = store.get(VE.profs).map(p => p.id === id ? { ...p, ...data } : p);
      store.set(VE.profs, list);
      return list.find(p => p.id === id);
    },
    delete(id) { store.set(VE.profs, store.get(VE.profs).filter(p => p.id !== id)); }
  },

  /* --- SENSORS --- */
  sensors: {
    getAll()          { return store.get(VE.sensors); },
    getByUser(userId) { return store.get(VE.sensors).filter(s => s.userId === userId); },
    create(data) {
      const list = store.get(VE.sensors);
      const item = { ...data, id: store.nextId(list) };
      store.set(VE.sensors, [...list, item]);
      return item;
    },
    update(id, data) {
      const list = store.get(VE.sensors).map(s => s.id === id ? { ...s, ...data } : s);
      store.set(VE.sensors, list);
      return list.find(s => s.id === id);
    },
    delete(id) { store.set(VE.sensors, store.get(VE.sensors).filter(s => s.id !== id)); }
  },

  /* --- SESSIONS --- */
  sessions: {
    getAll()          { return store.get(VE.sessions); },
    getByUser(userId) { return store.get(VE.sessions).filter(s => s.userId === userId); },
    create(data) {
      const list = store.get(VE.sessions);
      const item = { ...data, id: store.nextId(list) };
      store.set(VE.sessions, [...list, item]);
      return item;
    },
    update(id, data) {
      const list = store.get(VE.sessions).map(s => s.id === id ? { ...s, ...data } : s);
      store.set(VE.sessions, list);
      return list.find(s => s.id === id);
    },
    delete(id) { store.set(VE.sessions, store.get(VE.sessions).filter(s => s.id !== id)); }
  },

  /* --- SENSOR DATA --- */
  sensorData: {
    getAll()              { return store.get(VE.sensorData); },
    getBySession(sid)     { return store.get(VE.sensorData).filter(d => d.sessionId === sid); },
    simulate(sessionId)   {
      const list = store.get(VE.sensorData);
      const hr = Math.floor(68 + Math.random() * 82);
      const rec = {
        id: store.nextId(list), sessionId,
        heartRate:     hr,
        movementLevel: ['Baixo','Moderado','Alto'][Math.floor(Math.random()*3)],
        effort:        Math.floor(1 + Math.random() * 9),
        fatigue:       hr > 135 ? 'Fadiga moderada' : hr > 110 ? 'Fadiga leve' : 'Sem fadiga',
        recordedAt:    new Date().toISOString()
      };
      store.set(VE.sensorData, [...list, rec]);
      return rec;
    }
  },

  /* --- ALERTS --- */
  alerts: {
    getAll()    { return store.get(VE.alerts); },
    getUnread() { return store.get(VE.alerts).filter(a => !a.read); },
    markRead(id) {
      store.set(VE.alerts, store.get(VE.alerts).map(a => a.id === id ? { ...a, read: true } : a));
    },
    markAllRead() {
      store.set(VE.alerts, store.get(VE.alerts).map(a => ({ ...a, read: true })));
    },
    add(type, message) {
      const list = store.get(VE.alerts);
      const now = new Date();
      const item = { id: store.nextId(list), type, message, time: now.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}), read: false };
      store.set(VE.alerts, [item, ...list]);
    }
  },

  /* --- REPORTS --- */
  reports: {
    forUser(userId) {
      const sessions = store.get(VE.sessions).filter(s => s.userId === userId && s.status === 'Concluída');
      const allData  = store.get(VE.sensorData);
      return sessions.map(s => {
        const data = allData.filter(d => d.sessionId === s.id);
        if (!data.length) return null;
        const hrs = data.map(d => d.heartRate);
        return {
          session:  s,
          avgHR:    Math.round(hrs.reduce((a,b) => a+b, 0) / hrs.length),
          maxHR:    Math.max(...hrs),
          minHR:    Math.min(...hrs),
          avgEffort:Math.round(data.reduce((a,b) => a+b.effort,0) / data.length * 10) / 10,
          records:  data.length
        };
      }).filter(Boolean);
    }
  }
};

/* ============================================================
   UTILITÁRIOS GLOBAIS
   ============================================================ */
function today() {
  return new Date().toISOString().split('T')[0];
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('pt-BR');
}

function fmtDateTime(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function fmtTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getDuration(start, end) {
  if (!start || !end) return '—';
  const ms  = new Date(end) - new Date(start);
  const min = Math.floor(ms / 60000);
  return `${min} min`;
}

function getInitials(name) {
  return (name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}

function showToast(message, type = 'success') {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'●'}</span><span>${message}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.cssText = 'opacity:0;transform:translateX(16px);transition:0.25s'; setTimeout(()=>t.remove(),250); }, 3200);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

function setTopbarUser(user) {
  const nameEl = document.getElementById('topbarUserName');
  const avatarEl = document.getElementById('topbarAvatar');
  if (!user) return;
  if (nameEl)   nameEl.textContent = user.name;
  if (avatarEl) avatarEl.textContent = user.initials || getInitials(user.name);
  const sidebarNameEl = document.getElementById('sidebarUserName');
  if (sidebarNameEl) sidebarNameEl.textContent = user.name;
}

/* Auto-inicializar */
seedIfEmpty();
