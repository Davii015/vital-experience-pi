/* dashboard.js */
const avatarColors = ['#F5E642','#1DB954','#FF2D7A','#3b82f6','#f97316'];

function avatarColor(id) { return avatarColors[(id - 1) % avatarColors.length]; }

function renderStats(summary) {
  const sessions = API.sessions.getAll();
  const sensors  = API.sensors.getAll();
  const active   = sessions.filter(s => s.status === 'Em andamento').length;
  const actSens  = sensors.filter(s => s.status === 'Ativo').length;

  document.getElementById('statUsers').textContent    = summary.users;
  document.getElementById('statProfs').textContent    = summary.professionals;
  document.getElementById('statSessions').textContent = summary.sessions;
  document.getElementById('statSensors').textContent  = summary.activeSensors;
  document.getElementById('statActiveSessions').textContent = active;

  const done = sessions.filter(s => s.status === 'Concluída').length;
  document.getElementById('summDone').textContent     = `${done}/${sessions.length}`;
  document.getElementById('summDoneBar').style.width  = sessions.length ? `${(done/sessions.length)*100}%` : '0%';
  document.getElementById('summSensors').textContent  = `${actSens}/${sensors.length}`;
  document.getElementById('summSensorsBar').style.width = sensors.length ? `${(actSens/sensors.length)*100}%` : '0%';
  document.getElementById('summData').textContent     = `${summary.sensorReadings} registros`;
  document.getElementById('alertDot').style.display = 'none';
}

function renderSessions() {
  const sessions = API.sessions.getAll().slice(0, 5);
  const users    = API.users.getAll();
  const tbody    = document.getElementById('sessionsTbody');

  if (!sessions.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><span class="empty-icon">📋</span><h3>Nenhuma sessão registrada</h3><p>Crie a primeira sessão de monitoramento.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = sessions.map(s => {
    const u     = users.find(u => u.id === s.userId);
    const uName = u ? u.name : 'Usuário removido';
    const color = u ? avatarColor(u.id) : '#9E9E9A';
    const dur   = getDuration(s.startTime, s.endTime);
    const badge = s.status === 'Concluída'
      ? '<span class="badge badge-green">Concluída</span>'
      : s.status === 'Cancelada'
        ? '<span class="badge badge-gray">Cancelada</span>'
        : '<span class="badge badge-yellow">Em andamento</span>';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:30px;height:30px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-family:var(--font-syne);font-weight:700;font-size:10px;color:var(--black);flex-shrink:0">${escapeHtml(getInitials(uName))}</div>
            <div>
            <div class="td-primary">${escapeHtml(uName)}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size:12.5px">${escapeHtml(s.type)}</span></td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">${fmtDateTime(s.startTime)}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${dur}</td>
        <td>${badge}</td>
      </tr>`;
  }).join('');
}

function renderAlerts() {
  document.getElementById('alertCount').textContent = 'Recurso pendente';
  document.getElementById('alertsList').innerHTML = '<div style="padding:24px 0;text-align:center;color:var(--gray-400);font-size:13px">Alertas automáticos ainda não possuem fonte persistente.</div>';
}

function renderHRSparkline() {
  const data = API.sensorData.getAll();
  if (!data.length) {
    document.getElementById('avgHRVal').textContent = '—';
    return;
  }
  const hrs    = data.map(d => d.heartRate).filter(Number.isFinite);
  if (!hrs.length) { document.getElementById('avgHRVal').textContent = '—'; return; }
  const avgHR  = Math.round(hrs.reduce((a,b) => a+b, 0) / hrs.length);
  const maxHR  = Math.max(...hrs);
  const minHR  = Math.min(...hrs);

  document.getElementById('avgHRVal').textContent = avgHR;
  document.getElementById('hrRange').textContent  = `Mín ${minHR} · Máx ${maxHR}`;

  const sample = hrs.slice(-16);
  const mx     = Math.max(...sample);
  const sparkEl = document.getElementById('hrSparkline');
  sparkEl.innerHTML = sample.map(h => {
    const pct  = Math.round((h / mx) * 100);
    const isPeak = h === mx;
    return `<div class="hr-bar${isPeak ? ' peak' : ''}" style="height:${pct}%"></div>`;
  }).join('');
}

function renderGreeting(user) {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('dashGreeting').textContent = `${greet}, ${user.name} — ${new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'})}`;
}

async function init() {
  const user = await API.auth.requireAuth();
  if (!user) return;
  setTopbarUser(user);
  renderGreeting(user);
  try {
    const [, summary] = await Promise.all([
      API.load('users', 'professionals', 'sensors', 'sessions', 'sensorData'),
      API.reports.summary(),
    ]);
    renderStats(summary);
    renderSessions();
    renderAlerts();
    renderHRSparkline();
  } catch (error) { showToast(error.message, 'error'); }
}
init();
