/* dashboard.js */
const user = API.auth.requireAuth();
if (user) setTopbarUser(user);

const avatarColors = ['#F5E642','#1DB954','#FF2D7A','#3b82f6','#f97316'];

function avatarColor(id) { return avatarColors[(id - 1) % avatarColors.length]; }

function renderStats() {
  const users    = API.users.getAll();
  const profs    = API.professionals.getAll();
  const sessions = API.sessions.getAll();
  const sensors  = API.sensors.getAll();
  const active   = sessions.filter(s => s.status === 'Em andamento').length;
  const actSens  = sensors.filter(s => s.status === 'Ativo').length;

  document.getElementById('statUsers').textContent    = users.length;
  document.getElementById('statProfs').textContent    = profs.length;
  document.getElementById('statSessions').textContent = sessions.length;
  document.getElementById('statSensors').textContent  = actSens;
  document.getElementById('statActiveSessions').textContent = active;

  const done = sessions.filter(s => s.status === 'Concluída').length;
  document.getElementById('summDone').textContent     = `${done}/${sessions.length}`;
  document.getElementById('summDoneBar').style.width  = sessions.length ? `${(done/sessions.length)*100}%` : '0%';
  document.getElementById('summSensors').textContent  = `${actSens}/${sensors.length}`;
  document.getElementById('summSensorsBar').style.width = sensors.length ? `${(actSens/sensors.length)*100}%` : '0%';
  const allData = API.sensorData.getAll();
  document.getElementById('summData').textContent     = `${allData.length} registros`;

  const unread = API.alerts.getUnread().length;
  document.getElementById('alertDot').style.display = unread ? 'block' : 'none';
}

function renderSessions() {
  const sessions = API.sessions.getAll().slice(-5).reverse();
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
      : '<span class="badge badge-yellow">Em andamento</span>';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:30px;height:30px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-family:var(--font-syne);font-weight:700;font-size:10px;color:var(--black);flex-shrink:0">${getInitials(uName)}</div>
            <div>
              <div class="td-primary">${uName}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size:12.5px">${s.type}</span></td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">${fmtDateTime(s.startTime)}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${dur}</td>
        <td>${badge}</td>
      </tr>`;
  }).join('');
}

function renderAlerts() {
  const alerts = API.alerts.getAll();
  const list   = document.getElementById('alertsList');
  const unread = alerts.filter(a => !a.read).length;
  document.getElementById('alertCount').textContent = unread > 0 ? `${unread} não lida(s)` : 'Nenhuma pendente';

  if (!alerts.length) {
    list.innerHTML = `<div style="padding:24px 0;text-align:center;color:var(--gray-400);font-size:13px">Sem alertas</div>`;
    return;
  }

  list.innerHTML = alerts.map(a => `
    <div class="alert-item" style="${a.read ? 'opacity:0.5' : ''}">
      <div class="alert-dot ${a.type}"></div>
      <div style="flex:1">
        <div class="alert-msg">${a.message}</div>
        <div class="alert-time">${a.time}</div>
      </div>
      ${!a.read ? `<button onclick="markAlert(${a.id})" style="font-size:11px;color:var(--gray-400);padding:3px 7px;border:1px solid var(--gray-200);border-radius:4px;background:none;cursor:pointer">Lida</button>` : ''}
    </div>`).join('');
}

function renderHRSparkline() {
  const data = API.sensorData.getAll();
  if (!data.length) {
    document.getElementById('avgHRVal').textContent = '—';
    return;
  }
  const hrs    = data.map(d => d.heartRate);
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

function markAlert(id) {
  API.alerts.markRead(id);
  renderAlerts();
  renderStats();
}

function markAllAlertsRead() {
  API.alerts.markAllRead();
  renderAlerts();
  renderStats();
  showToast('Todos os alertas marcados como lidos');
}

// Greeting
(function() {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('dashGreeting').textContent = `${greet}, ${user ? user.name : 'usuário'} — ${new Date().toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'})}`;
})();

// Render all
renderStats();
renderSessions();
renderAlerts();
renderHRSparkline();
