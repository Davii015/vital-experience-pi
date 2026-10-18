/* sessoes.js */
let editingId = null, deletingId = null;

const statusColors = {
  'Concluída':    '#1DB954',
  'Em andamento': '#F5E642',
  'Cancelada':    '#FF2D7A'
};

function loadUserOptions(selectedId = '') {
  const sel = document.getElementById('fUser');
  sel.innerHTML = '<option value="">Selecione o paciente</option>';
  API.users.getAll().filter(u => u.status === 'ATIVO' || u.id === Number(selectedId)).forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id; opt.textContent = u.name;
    sel.appendChild(opt);
  });
  sel.value = selectedId;
}

function updateStats() {
  const all = API.sessions.getAll();
  document.getElementById('totalSessions').textContent     = all.length;
  document.getElementById('doneSessions').textContent      = all.filter(s => s.status === 'Concluída').length;
  document.getElementById('activeSessions').textContent    = all.filter(s => s.status === 'Em andamento').length;
  document.getElementById('canceledSessions').textContent = all.filter(s => s.status === 'Cancelada').length;
}

function renderTable() {
  const q          = document.getElementById('searchInput').value.toLowerCase();
  const filterSt   = document.getElementById('filterStatus').value;
  const users      = API.users.getAll();
  const profs      = API.professionals.getAll();
  const sessions   = API.sessions.getAll().filter(s => {
    const u = users.find(u => u.id === s.userId);
    const matchQ  = !q || (u && u.name.toLowerCase().includes(q)) || (s.type||'').toLowerCase().includes(q);
    const matchSt = !filterSt || s.status === filterSt;
    return matchQ && matchSt;
  });

  const tbody = document.getElementById('tbody');
  document.getElementById('countLabel').textContent = `${sessions.length} registro(s)`;
  updateStats();

  if (!sessions.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><span class="empty-icon">▶</span><h3>${q || filterSt ? 'Nenhum resultado' : 'Nenhuma sessão registrada'}</h3><p>Clique em "+ Nova Sessão" para começar.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = sessions.map(s => {
    const u     = users.find(u => u.id === s.userId);
    const prof  = u ? profs.find(p => p.id === u.professionalId) : null;
    const color = statusColors[s.status] || '#9E9E9A';
    const dur   = s.endTime ? getDuration(s.startTime, s.endTime) : '—';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:50%;background:#F5E642;display:flex;align-items:center;justify-content:center;font-family:var(--font-syne);font-weight:700;font-size:10px;color:var(--black);flex-shrink:0">${u ? escapeHtml(getInitials(u.name)) : '?'}</div>
            <div><div class="td-primary">${escapeHtml(u ? u.name : 'Usuário removido')}</div><div class="td-sub">ID #${s.id}</div></div>
          </div>
        </td>
        <td><span class="badge badge-gray">${escapeHtml(s.type||'—')}</span></td>
        <td style="font-family:var(--font-mono);font-size:12px">${fmtDateTime(s.startTime)}</td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">${dur}</td>
        <td style="font-size:12.5px">${prof ? escapeHtml(prof.name) : '<span style="color:var(--gray-400)">—</span>'}</td>
        <td><span class="badge" style="background:${color}22;color:${color}">${s.status}</span></td>
        <td>
          <div class="td-actions">
            <button class="btn btn-sm btn-ghost btn-icon" title="Editar" onclick="openModal(${s.id})">✎</button>
            <button class="btn btn-sm btn-danger btn-icon" title="Remover" onclick="openDelete(${s.id})">✕</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openModal(id = null) {
  editingId = id;
  document.getElementById('formError').style.display = 'none';
  if (id) {
    const s = API.sessions.getById(id);
    loadUserOptions(s.userId || '');
    document.getElementById('modalTitle').textContent = 'Editar Sessão';
    document.getElementById('fType').value   = s.type   || '';
    document.getElementById('fStatus').value = s.status || 'Em andamento';
    document.getElementById('fNotes').value  = s.notes  || '';
    document.getElementById('fStart').value  = toLocalDateTime(s.startTime);
    document.getElementById('fEnd').value    = toLocalDateTime(s.endTime);
  } else {
    loadUserOptions();
    document.getElementById('modalTitle').textContent = 'Nova Sessão';
    document.getElementById('fType').value   = '';
    document.getElementById('fStatus').value = 'Em andamento';
    document.getElementById('fNotes').value  = '';
    const now = new Date();
    now.setSeconds(0,0);
    document.getElementById('fStart').value = toLocalDateTime(now);
    document.getElementById('fEnd').value   = '';
  }
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); editingId = null; }

async function saveSession() {
  const userId    = parseInt(document.getElementById('fUser').value) || null;
  const type      = document.getElementById('fType').value;
  const startTime = document.getElementById('fStart').value;
  const endTime   = document.getElementById('fEnd').value || null;
  const status    = document.getElementById('fStatus').value;
  const notes     = document.getElementById('fNotes').value.trim();
  const errEl     = document.getElementById('formError');

  if (!userId)    { errEl.textContent = 'Selecione o paciente.';           errEl.style.display='block'; return; }
  if (!type)      { errEl.textContent = 'Selecione o tipo de sessão.';     errEl.style.display='block'; return; }
  if (!startTime) { errEl.textContent = 'Informe a data/hora de início.';  errEl.style.display='block'; return; }

  errEl.style.display = 'none';
  const selectedUser = API.users.getById(userId);
  const data = { userId, professionalId: selectedUser?.professionalId || null, type, startTime: new Date(startTime).toISOString(), endTime: endTime ? new Date(endTime).toISOString() : null, status, notes };

  try {
    if (editingId) { await API.sessions.update(editingId, data); showToast('Sessão atualizada'); }
    else           { await API.sessions.create(data);             showToast('Sessão registrada'); }
    closeModal(); renderTable();
  } catch (error) { errEl.textContent = error.message; errEl.style.display = 'block'; }
}

function openDelete(id) {
  deletingId = id;
  const selected = API.sessions.getById(id);
  document.getElementById('deleteSessionName').textContent = API.users.getById(selected?.userId)?.name || 'usuário removido';
  document.getElementById('deleteOverlay').classList.add('active');
}

function closeDelete() { document.getElementById('deleteOverlay').classList.remove('active'); deletingId = null; }

async function confirmDelete() {
  try {
    await API.sessions.delete(deletingId);
    showToast('Sessão removida', 'warning');
    closeDelete(); renderTable();
  } catch (error) { showToast(error.message, 'error'); }
}

async function init() {
  const user = await API.auth.requireAuth();
  if (!user) return;
  setTopbarUser(user);
  try { await API.load('sessions', 'users', 'professionals'); renderTable(); }
  catch (error) { showToast(error.message, 'error'); }
}
init();
