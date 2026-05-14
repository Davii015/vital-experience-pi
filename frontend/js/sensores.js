/* sensores.js */
const user = API.auth.requireAuth();
if (user) setTopbarUser(user);

let editingId = null, deletingId = null;

function loadUserOptions(selectedId = '') {
  const sel = document.getElementById('fUser');
  const cur = selectedId || sel.value;
  sel.innerHTML = '<option value="">Sem associação</option>';
  API.users.getAll().forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id; opt.textContent = u.name;
    sel.appendChild(opt);
  });
  sel.value = cur;
}

function updateStats() {
  const all = API.sensors.getAll();
  document.getElementById('totalSensors').textContent    = all.length;
  document.getElementById('activeSensors').textContent   = all.filter(s => s.status === 'Ativo').length;
  document.getElementById('inactiveSensors').textContent = all.filter(s => s.status !== 'Ativo').length;
}

function renderTable() {
  const q       = document.getElementById('searchInput').value.toLowerCase();
  const sensors = API.sensors.getAll().filter(s =>
    !q || (s.type||'').toLowerCase().includes(q) ||
          (s.model||'').toLowerCase().includes(q) ||
          (s.serial||'').toLowerCase().includes(q)
  );
  const users = API.users.getAll();
  const tbody = document.getElementById('tbody');
  document.getElementById('countLabel').textContent = `${sensors.length} registro(s)`;

  updateStats();

  if (!sensors.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><span class="empty-icon">📡</span><h3>${document.getElementById('searchInput').value ? 'Nenhum resultado' : 'Nenhum sensor cadastrado'}</h3><p>Clique em "+ Novo Sensor" para começar.</p></div></td></tr>`;
    return;
  }

  const statusColor = { 'Ativo': '#1DB954', 'Inativo': '#9E9E9A', 'Em manutenção': '#f97316' };

  tbody.innerHTML = sensors.map(s => {
    const u = users.find(u => u.id === s.userId);
    const color = statusColor[s.status] || '#9E9E9A';
    return `
      <tr>
        <td><span class="badge" style="background:${color}22;color:${color}">${s.type||'—'}</span></td>
        <td><div class="td-primary">${s.model||'—'}</div></td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-400)">${s.serial||'—'}</td>
        <td>${u ? `<div class="td-primary" style="font-size:12.5px">${u.name}</div>` : '<span class="badge badge-gray">Não associado</span>'}</td>
        <td><span class="badge" style="background:${color}22;color:${color}">${s.status||'—'}</span></td>
        <td>
          <div class="td-actions">
            <button class="btn btn-sm btn-ghost btn-icon" title="Editar" onclick="openModal(${s.id})">✎</button>
            <button class="btn btn-sm btn-danger btn-icon" title="Remover" onclick="openDelete(${s.id},'${(s.model||'Sensor').replace(/'/g,"\\'")}')">✕</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function openModal(id = null) {
  editingId = id;
  loadUserOptions();
  document.getElementById('formError').style.display = 'none';
  if (id) {
    const s = API.sensors.getAll().find(s => s.id === id);
    document.getElementById('modalTitle').textContent = 'Editar Sensor';
    document.getElementById('fType').value   = s.type   || '';
    document.getElementById('fModel').value  = s.model  || '';
    document.getElementById('fSerial').value = s.serial || '';
    document.getElementById('fStatus').value = s.status || 'Ativo';
    document.getElementById('fUser').value   = s.userId || '';
  } else {
    document.getElementById('modalTitle').textContent = 'Novo Sensor';
    ['fModel','fSerial'].forEach(f => document.getElementById(f).value = '');
    document.getElementById('fType').value   = '';
    document.getElementById('fStatus').value = 'Ativo';
    document.getElementById('fUser').value   = '';
  }
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); editingId = null; }

function saveSensor() {
  const type   = document.getElementById('fType').value;
  const model  = document.getElementById('fModel').value.trim();
  const serial = document.getElementById('fSerial').value.trim();
  const status = document.getElementById('fStatus').value;
  const userId = parseInt(document.getElementById('fUser').value) || null;
  const errEl  = document.getElementById('formError');

  if (!type)  { errEl.textContent = 'Tipo de sensor é obrigatório.'; errEl.style.display='block'; return; }
  if (!model) { errEl.textContent = 'Modelo é obrigatório.';         errEl.style.display='block'; return; }

  errEl.style.display = 'none';
  const data = { type, model, serial, status, userId };

  if (editingId) { API.sensors.update(editingId, data); showToast('Sensor atualizado'); }
  else           { API.sensors.create(data);             showToast('Sensor cadastrado'); }

  closeModal(); renderTable();
}

function openDelete(id, name) {
  deletingId = id;
  document.getElementById('deleteSensorName').textContent = name;
  document.getElementById('deleteOverlay').classList.add('active');
}

function closeDelete() { document.getElementById('deleteOverlay').classList.remove('active'); deletingId = null; }

function confirmDelete() {
  API.sensors.delete(deletingId);
  showToast('Sensor removido', 'warning');
  closeDelete(); renderTable();
}

renderTable();
