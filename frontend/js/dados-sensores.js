/* dados-sensores.js */
const user = API.auth.requireAuth();
if (user) setTopbarUser(user);

function loadSessionFilter() {
  const sel = document.getElementById('filterSession');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todas as sessões</option>';
  const sessions = API.sessions.getAll();
  const users    = API.users.getAll();
  sessions.forEach(s => {
    const u   = users.find(u => u.id === s.userId);
    const opt = document.createElement('option');
    opt.value       = s.id;
    opt.textContent = `Sessão #${s.id} — ${u ? u.name : '?'} (${s.type})`;
    sel.appendChild(opt);
  });
  sel.value = cur;
}

function updateStats() {
  const all = API.sensorData.getAll();
  document.getElementById('totalReadings').textContent = all.length;
  if (!all.length) {
    document.getElementById('avgHR').textContent  = '—';
    document.getElementById('maxHR').textContent  = '—';
    document.getElementById('avgSpO2').textContent = '—';
    return;
  }
  const hrs   = all.map(d => d.heartRate).filter(Boolean);
  const spo2s = all.map(d => d.spO2).filter(Boolean);
  document.getElementById('avgHR').textContent   = hrs.length   ? Math.round(hrs.reduce((a,b) => a+b,0)   / hrs.length)   : '—';
  document.getElementById('maxHR').textContent   = hrs.length   ? Math.max(...hrs)                                         : '—';
  document.getElementById('avgSpO2').textContent = spo2s.length ? (spo2s.reduce((a,b) => a+b,0) / spo2s.length).toFixed(1) : '—';
}

function renderChart() {
  const all  = API.sensorData.getAll().slice(-40);
  const chart = document.getElementById('hrChart');
  if (!all.length) { chart.innerHTML = '<span style="color:var(--gray-400);font-size:12px">Sem dados</span>'; return; }
  const hrs = all.map(d => d.heartRate || 0);
  const max = Math.max(...hrs) || 1;
  chart.innerHTML = hrs.map(v => {
    const pct   = Math.round((v / max) * 100);
    const color = v > 140 ? '#FF2D7A' : v > 120 ? '#F5E642' : '#1DB954';
    return `<div title="${v} bpm" style="flex:1;background:${color};height:${Math.max(pct,4)}%;border-radius:2px 2px 0 0;transition:.3s"></div>`;
  }).join('');
}

function renderTable() {
  const q         = document.getElementById('searchInput').value.toLowerCase();
  const filterSid = parseInt(document.getElementById('filterSession').value) || null;
  const sessions  = API.sessions.getAll();
  const users     = API.users.getAll();

  let data = API.sensorData.getAll();
  if (filterSid) data = data.filter(d => d.sessionId === filterSid);
  if (q) data = data.filter(d => {
    const s = sessions.find(s => s.id === d.sessionId);
    const u = s ? users.find(u => u.id === s.userId) : null;
    return (u && u.name.toLowerCase().includes(q)) ||
           (d.fatigueState||'').toLowerCase().includes(q) ||
           String(d.sessionId).includes(q);
  });

  const tbody = document.getElementById('tbody');
  document.getElementById('countLabel').textContent = `${data.length} leitura(s)`;
  updateStats();
  renderChart();

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><span class="empty-icon">📊</span><h3>Nenhuma leitura encontrada</h3><p>Use "Simular Leitura" para gerar dados ou ajuste os filtros.</p></div></td></tr>`;
    return;
  }

  const effortColors = { 'Baixo':'#1DB954','Moderado':'#F5E642','Alto':'#f97316','Muito Alto':'#FF2D7A' };
  const fatigueColors = { 'Descansado':'#1DB954','Alerta':'#F5E642','Cansado':'#f97316','Exausto':'#FF2D7A' };

  tbody.innerHTML = [...data].reverse().map(d => {
    const sess  = sessions.find(s => s.id === d.sessionId);
    const u     = sess ? users.find(u => u.id === sess.userId) : null;
    const hrColor = d.heartRate > 140 ? '#FF2D7A' : d.heartRate > 120 ? '#F5E642' : '#1DB954';
    const efColor = effortColors[d.effortLevel]  || '#9E9E9A';
    const ftColor = fatigueColors[d.fatigueState] || '#9E9E9A';
    return `
      <tr>
        <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">#${d.sessionId}</span></td>
        <td style="font-size:12.5px">${u ? u.name : '<span style="color:var(--gray-400)">—</span>'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:8px;height:8px;border-radius:50%;background:${hrColor}"></div>
            <span style="font-family:var(--font-mono);font-weight:600">${d.heartRate||'—'}</span>
          </div>
        </td>
        <td style="font-family:var(--font-mono);font-size:13px">${d.movement !== undefined ? d.movement.toFixed(2) : '—'}</td>
        <td><span class="badge" style="background:${efColor}22;color:${efColor}">${d.effortLevel||'—'}</span></td>
        <td style="font-family:var(--font-mono);font-size:13px">${d.spO2 !== undefined ? d.spO2.toFixed(1) : '—'}</td>
        <td><span class="badge" style="background:${ftColor}22;color:${ftColor}">${d.fatigueState||'—'}</span></td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--gray-400)">${fmtDateTime(d.timestamp)}</td>
      </tr>`;
  }).join('');
}

function simulateData() {
  const sessions = API.sessions.getAll().filter(s => s.status === 'Em andamento' || s.status === 'Concluída');
  if (!sessions.length) { showToast('Nenhuma sessão disponível para simular', 'warning'); return; }
  const s = sessions[Math.floor(Math.random() * sessions.length)];
  API.sensorData.simulate(s.id);
  showToast('Leitura simulada adicionada');
  renderTable();
}

loadSessionFilter();
renderTable();
