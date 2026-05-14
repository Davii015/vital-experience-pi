/* relatorios.js */
const user = API.auth.requireAuth();
if (user) setTopbarUser(user);

function populateUserSelect() {
  const sel = document.getElementById('userSelect');
  API.users.getAll().forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id; opt.textContent = `${u.name} — ${u.condition}`;
    sel.appendChild(opt);
  });
}

function renderBarChart(container, data, colorMap) {
  if (!data || !Object.keys(data).length) {
    container.innerHTML = '<span style="color:var(--gray-400);font-size:12px">Sem dados</span>';
    return;
  }
  const total = Object.values(data).reduce((a,b) => a+b, 0);
  container.innerHTML = Object.entries(data).map(([label, count]) => {
    const pct   = total ? Math.round((count / total) * 100) : 0;
    const color = colorMap[label] || '#9E9E9A';
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px">${label}</span>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--gray-400)">${count} (${pct}%)</span>
        </div>
        <div style="height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:.4s"></div>
        </div>
      </div>`;
  }).join('');
}

function loadReport() {
  const uid = parseInt(document.getElementById('userSelect').value) || null;
  if (!uid) {
    document.getElementById('reportEmpty').style.display   = 'block';
    document.getElementById('reportContent').style.display = 'none';
    return;
  }

  const report = API.reports.forUser(uid);
  const u      = API.users.getById(uid);
  const profs  = API.professionals.getAll();
  const prof   = profs.find(p => p.id === u.professionalId);

  document.getElementById('reportEmpty').style.display   = 'none';
  document.getElementById('reportContent').style.display = 'block';

  // Cabeçalho
  document.getElementById('repAvatar').textContent = getInitials(u.name);
  document.getElementById('repName').textContent   = u.name;
  document.getElementById('repMeta').textContent   = `${u.age} anos · ${u.gender} · ${u.condition}`;
  document.getElementById('repProf').textContent   = prof ? `Profissional: ${prof.name} (${prof.specialty})` : 'Sem profissional atribuído';

  // Stats
  document.getElementById('repTotalSessions').textContent = report.totalSessions;
  document.getElementById('repDone').textContent          = report.completedSessions;
  document.getElementById('repAvgHR').textContent         = report.avgHeartRate || '—';
  document.getElementById('repReadings').textContent      = report.totalReadings;

  // Gráfico FC
  const hrData = report.readings.map(r => r.heartRate || 0);
  const repChart = document.getElementById('repHRChart');
  if (hrData.length) {
    const maxHR = Math.max(...hrData) || 1;
    repChart.innerHTML = hrData.map(v => {
      const pct   = Math.round((v / maxHR) * 100);
      const color = v > 140 ? '#FF2D7A' : v > 120 ? '#F5E642' : '#1DB954';
      return `<div title="${v} bpm" style="flex:1;background:${color};height:${Math.max(pct,4)}%;border-radius:2px 2px 0 0;min-width:4px"></div>`;
    }).join('');
    const hrs = hrData.filter(Boolean);
    document.getElementById('repHRStats').innerHTML = [
      ['FC Mínima', Math.min(...hrs) + ' bpm', '#1DB954'],
      ['FC Média',  report.avgHeartRate + ' bpm', '#F5E642'],
      ['FC Máxima', Math.max(...hrs) + ' bpm', '#FF2D7A']
    ].map(([l,v,c]) => `<span style="font-size:12px"><span style="color:${c};font-weight:700">${v}</span> ${l}</span>`).join('');
  } else {
    repChart.innerHTML = '<span style="color:var(--gray-400);font-size:12px">Sem dados de FC</span>';
    document.getElementById('repHRStats').innerHTML = '';
  }

  // Esforço
  renderBarChart(
    document.getElementById('effortChart'),
    report.effortDistribution,
    { 'Baixo':'#1DB954','Moderado':'#F5E642','Alto':'#f97316','Muito Alto':'#FF2D7A' }
  );

  // Fadiga
  renderBarChart(
    document.getElementById('fatigueChart'),
    report.fatigueDistribution,
    { 'Descansado':'#1DB954','Alerta':'#F5E642','Cansado':'#f97316','Exausto':'#FF2D7A' }
  );

  // Tabela de sessões
  const statusColor = { 'Concluída':'#1DB954','Em andamento':'#F5E642','Agendada':'#3b82f6','Cancelada':'#FF2D7A' };
  const sensorData  = API.sensorData.getAll();
  document.getElementById('repSessionsTable').innerHTML = report.sessions.map(s => {
    const readings = sensorData.filter(d => d.sessionId === s.id);
    const hrs      = readings.map(d => d.heartRate).filter(Boolean);
    const avgHR    = hrs.length ? Math.round(hrs.reduce((a,b) => a+b,0) / hrs.length) : '—';
    const dur      = s.endTime ? getDuration(s.startTime, s.endTime) : '—';
    const color    = statusColor[s.status] || '#9E9E9A';
    return `
      <tr>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">#${s.id}</td>
        <td><span class="badge badge-gray">${s.type}</span></td>
        <td style="font-family:var(--font-mono);font-size:12px">${fmtDate(s.startTime)}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${dur}</td>
        <td style="font-family:var(--font-mono);font-size:13px;font-weight:600">${avgHR}${avgHR !== '—' ? ' bpm' : ''}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${readings.length}</td>
        <td><span class="badge" style="background:${color}22;color:${color}">${s.status}</span></td>
      </tr>`;
  }).join('') || `<tr><td colspan="7"><div class="empty-state" style="padding:24px"><span class="empty-icon" style="font-size:24px">📋</span><h3>Nenhuma sessão</h3></div></td></tr>`;
}

populateUserSelect();
